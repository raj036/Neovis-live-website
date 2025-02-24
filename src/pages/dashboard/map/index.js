import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import {
    Box, Button, Card, Container, Grid, Typography, Input, Divider,
    Autocomplete, TextField
} from "@mui/material";
import { useQuery, useMutation } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
// import { Plus as PlusIcon } from "../../../icons/plus";
// import { Search as SearchIcon } from "../../../icons/search";
// import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Geocode from "react-geocode";
import { GOOGLE_MAPS_APIKEY } from "../../../utils/constants";
import io from 'socket.io-client';
import dayjs from "dayjs";
const socket = io('https://vinspect-server-dev.herokuapp.com');
// 'http://localhost:8000'
// https://vinspect-server-dev.herokuapp.com

Geocode.setApiKey(GOOGLE_MAPS_APIKEY);

const MapView = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [catFilters, setCatFilters] = useState("");
    const [staFilters, setStaFilters] = useState("");
    const [selProperty, setSelProprty] = useState([]);
    const [propertyUsers, setPropertyUsers] = useState([])
    const [selUser, setSelUser] = useState([]);
    const [location, setLocation] = useState(null);
    const [taskUserLoaction, setTaskUserLocation] = useState([])
    const [userCoords, setUserCoords] = useState([])
    const [isShowDetails, setIsShowDetails] = useState(false)
    const [markerIndex, setMarkerIndex] = useState(null)
    const [unitFilter, setUnitFilter] = useState('')
    // console.log('selProperty', selProperty, 'taskUserLoaction', taskUserLoaction);

    const customInstance = useAxios();

    const { data: properties, isLoading } = useQuery("allProperty", () =>
        customInstance.get(`properties`)
    );

    const { mutateAsync: findPropertyUsers, isLoading: findPropertyUsersLoading, data: findPropertyUsersData } = useMutation((data) =>
        customInstance.post(`properties/get-property-users`, data)
    );
    // console.log('findPropertyUsersData', findPropertyUsersData);

    const { data: unitData, refetch, isLoading: isUnitLoading, isFetching } = useQuery("allUnit", () =>
        customInstance.get(
            `units?limit=1000&page=0&filter.property_id=${unitFilter}`
        ),
        { enabled: unitFilter !== '' }
    );
    // console.log('unitFilter', unitFilter);
    // console.log('unit data', unitData?.data?.data);

    useEffect(() => {
        if (selProperty.length > 0) {
            setUnitFilter(`$in:${selProperty.map(item => item.id)?.join(",")}`)
        }
    }, [selProperty])

    useEffect(() => {
        if (unitFilter !== '')
            refetch()
    }, [unitFilter])

    useEffect(() => {
        if (!location) {
            const currentLoc = localStorage.getItem('user location')
            setLocation(JSON.parse(currentLoc))
        }
    }, [location])

    useEffect(() => {
        (async () => {
            if (selProperty.length > 0) {
                const property_ids = selProperty.map(item => item.id)
                await findPropertyUsers({ property_ids })
            } else {
                setTaskUserLocation([])
            }
        })()
    }, [selProperty, findPropertyUsers])

    useEffect(() => {
        if (findPropertyUsersData !== undefined || findPropertyUsersData) {
            if (findPropertyUsersData.data && findPropertyUsersData.data?.data?.length > 0) {
                const coords = findPropertyUsersData.data.data.filter(item => item.users && item.users.length > 0)?.map(item => item.users)?.flat()?.filter(user => user.location_coordinate)?.map(item => ({ ...item, lat: item.location_coordinate[1], lng: item.location_coordinate[0] }))

                const foundUsers = findPropertyUsersData.data.data.filter(item => item.users && item.users.length > 0)?.map(item => item.users)?.flat()
                setPropertyUsers(foundUsers)
                console.log('foundUers', foundUsers);
                console.log('coords', coords);
                setTaskUserLocation(coords)
            }
        }
    }, [findPropertyUsersData])

    useEffect(() => {
        // Listen for a specific event
        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
        socket.on('message', (data) => {
            console.log('Received message:', data);
            //   {id:auth.id, 
            //     location_coordinate: [position.coords.longitude, position.coords.latitude],
            //   }
            let updateData = [...taskUserLoaction]
            updateData = updateData.map((item) => {
                if (item.id === data.id) {
                    if (data.location_coordinate !== undefined) {
                        item.lat = data.location_coordinate[1]
                        item.lng = data.location_coordinate[0]
                    } else {
                        item.lat = data.location_coordinate_end[1]
                        item.lng = data.location_coordinate_end[0]
                        console.log('refetch');
                        (async () => {
                            const property_ids = selProperty.map(item => item.id)
                            await findPropertyUsers({ property_ids })
                        })()
                    }
                    console.log('data.color', data.color);
                    item.color = data.color
                    return item
                } else {
                    return item
                }
            })
            setTaskUserLocation(updateData)
        });

        // Clean up the event listener on component unmount
        return () => {
            socket.off('message');
        };
    }, [taskUserLoaction, selProperty]);

    // useEffect(() => {
    //     if (taskUserLoaction.length > 0) {
    //         setUserCoords(taskUserLoaction.map(item => ({ lat: item.lat, lng: item.lng })))
    //     }
    // }, [taskUserLoaction])

    useEffect(() => {
        if (selProperty.length > 0) {
            const foundUsers = selProperty.filter(item => item.users && item.users.length > 0)?.map(item => item.users)?.flat()
            setPropertyUsers(foundUsers)
        } else {
            setPropertyUsers([])
        }
    }, [selProperty])

    useEffect(() => {
        if (selUser.length > 0) {
            setTaskUserLocation(selUser.filter(user => user.location_coordinate)?.map(item => ({ ...item, lat: item.location_coordinate[1], lng: item.location_coordinate[0] })))
        } else {
            setTaskUserLocation([])
        }
    }, [selUser])

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || findPropertyUsersLoading}>
                <Head>
                    <title>Dashboard: Map view</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 5,
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ mb: 4 }}>
                            <Grid container justifyContent="space-between" spacing={3}>
                                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                                    <Typography variant="h4">Map View</Typography>
                                </Grid>
                                <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
                                    <Autocomplete
                                        options={properties?.data?.data ?? []}
                                        getOptionLabel={(option) =>
                                            option.property_name ? option.property_name : ""
                                        }
                                        fullWidth
                                        disableClearable
                                        multiple={true}
                                        value={selProperty}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label="Select Property"
                                                placeholder="Select Property"
                                            />
                                        )}
                                        onChange={(event, newValue) => {
                                            // console.log('newValue', newValue);
                                            newValue ? setSelProprty(newValue) : setSelProprty([])
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
                                    <Autocomplete
                                        options={propertyUsers ?? []}
                                        getOptionLabel={(option) =>
                                            option.first_name ? `${option.first_name} ${option.last_name}` : ""
                                        }
                                        fullWidth
                                        disableClearable
                                        multiple={true}
                                        value={selUser}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label="Select Users"
                                                placeholder="Select Users"
                                            />
                                        )}
                                        onChange={(event, newValue) => {
                                            // console.log('user newValue', newValue);
                                            newValue ? setSelUser(newValue) : setSelUser([])
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            {window.google && (
                                <GoogleMap
                                    mapContainerStyle={{
                                        height: "60vh",
                                        marginTop: "15px",
                                    }}
                                    center={location}
                                    zoom={10}
                                >
                                    {unitData?.data?.data !== undefined && unitData?.data?.data.map((item, idx) =>
                                        item.address_same_as_property ?
                                            <Marker
                                                key={idx}
                                                position={{ lat: item?.property?.latitude, lng: item?.property?.longitude }}
                                                draggable={false}
                                                icon={{
                                                    url: 'https://res.cloudinary.com/toton007/image/upload/v1713764881/placeholder_ypcq5w.png',
                                                    // 'https://previews.123rf.com/images/i3alda/i3alda1507/i3alda150700014/42832396-map-pointer-with-home-icon-vector.jpg',
                                                    scaledSize: new window.google.maps.Size(40, 40)
                                                }}
                                            />
                                            :
                                            <Marker
                                                key={idx}
                                                position={{ lat: item.latitude, lng: item.longitude }}
                                                draggable={false}
                                                icon={{
                                                    url: 'https://res.cloudinary.com/toton007/image/upload/v1713764881/placeholder_ypcq5w.png',
                                                    //  'https://previews.123rf.com/images/i3alda/i3alda1507/i3alda150700014/42832396-map-pointer-with-home-icon-vector.jpg',
                                                    scaledSize: new window.google.maps.Size(40, 40)
                                                }}
                                            />
                                    )}
                                    {taskUserLoaction.length > 0 && taskUserLoaction.map((item, idx) =>
                                        item.color !== undefined && item.color ?
                                            <Marker
                                                key={idx}
                                                position={{ lat: item.lat, lng: item.lng }}
                                                draggable={false}
                                                onClick={() => {
                                                    setIsShowDetails(!isShowDetails)
                                                    setMarkerIndex(idx + 1)
                                                }}
                                                icon={{
                                                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                                    scaledSize: new window.google.maps.Size(40, 40)
                                                }}
                                            >
                                                {isShowDetails && markerIndex && markerIndex === idx + 1 &&
                                                    <InfoWindow position={{ lat: item.lat, lng: item.lng }} onCloseClick={() => setIsShowDetails(!isShowDetails)}>
                                                        <Box>
                                                            <Typography>User name: {item.first_name} {item.last_name}</Typography>
                                                            {item.completed_task ?
                                                                <Box>
                                                                    <Typography>Task title: {item.completed_task.task_title}</Typography>
                                                                    <Typography>Task type: {item.completed_task.task_type}</Typography>
                                                                    <Typography>Completed at: {dayjs(new Date(item.completed_task.completed_at)).format("lll")}</Typography>
                                                                </Box>
                                                                :
                                                                <Box>
                                                                    <Typography>No task found</Typography>
                                                                </Box>
                                                            }
                                                        </Box>
                                                    </InfoWindow>
                                                }
                                            </Marker>
                                            :
                                            <Marker
                                                key={idx}
                                                position={{ lat: item.lat, lng: item.lng }}
                                                draggable={false}
                                                icon={{
                                                    url: 'https://res.cloudinary.com/toton007/image/upload/v1713764725/location_a27fzm.png',
                                                    // 'https://cdn3.iconfinder.com/data/icons/maps-and-navigation-7/65/68-512.png',
                                                    scaledSize: new window.google.maps.Size(40, 40)
                                                }}
                                                onClick={() => {
                                                    setIsShowDetails(!isShowDetails)
                                                    setMarkerIndex(idx + 1)
                                                }}
                                            >
                                                {isShowDetails && markerIndex && markerIndex === idx + 1 &&
                                                    <InfoWindow position={{ lat: item.lat, lng: item.lng }} onCloseClick={() => setIsShowDetails(!isShowDetails)}>
                                                        <Box>
                                                            <Typography>User name: {item.first_name} {item.last_name}</Typography>
                                                            {item.completed_task ?
                                                                <Box>
                                                                    <Typography>Task title: {item.completed_task.task_title}</Typography>
                                                                    <Typography>Task type: {item.completed_task.task_type}</Typography>
                                                                    <Typography>Completed at: {dayjs(new Date(item.completed_task.completed_at)).format("lll")}</Typography>
                                                                </Box>
                                                                :
                                                                <Box>
                                                                    <Typography>No task found</Typography>
                                                                </Box>
                                                            }
                                                        </Box>
                                                    </InfoWindow>
                                                }
                                            </Marker>
                                    )}
                                </GoogleMap>
                            )}
                        </Box>

                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default MapView;
