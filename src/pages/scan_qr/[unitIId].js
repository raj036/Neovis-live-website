import React from 'react';
import styles from "./request-now-page.module.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const MainPage = () => {
    const router = useRouter();

    // ✅ Navigate to the next page with unitId
    const [unitId, setUnitId] = useState();

    // Extract ID from the path parameter instead of query
    useEffect(() => {
        if (router.isReady && router.pathname.includes('/scan_qr/')) {
            // Extract the ID from the path
            const pathId = router.asPath.split('/').pop();
            setUnitId(pathId);
            console.log("Scanned Unit ID:", pathId);
        }
    }, [router.isReady, router.asPath]);

    // Navigate to the next page with unitId
    const handleBookNow = () => {
        if (unitId) {
            router.push(`/scan_unit/${unitId}`);  // For path-based routing

        } else {
            console.log("Unit ID is not available yet.");
        }
    };
    return (
        <>
            <div className={styles.requestNowPage1}>
                <div className={styles.requestNowPage1Child} />
                {/* <FrameComponent rectangle17="/rectangle-17.svg" /> */}
                <section className={styles.frameParent}>
                    <div className={styles.frameGroup}>
                        <div className={styles.frameWrapper}>
                            <div className={styles.frameContainer}>
                                <div className={styles.rectangleWrapper}>
                                    <div className={styles.frameChild} />
                                </div>
                            </div>
                        </div>
                        {/* <div className={styles.frameItemleft} /> */}
                        <div className={styles.frameItem} />
                        <div className={styles.xmlid2Parent}>
                            <div className={styles.whatIsDpl1}>
                                Enhance Your Stay By Booking Our Products And Services, Feel Free
                                To Share With Us By Selecting This Menu Options Here -
                            </div>
                            <div className={styles.frameDiv}>
                                <div className={styles.frameParent1}>
                                    <div className={styles.frameParent2}>
                                        <div className={styles.vectorParent}>
                                            <img
                                                className={styles.frameInner}
                                                alt=""
                                                src="/rectangle-34.svg"
                                            />
                                            <div className={styles.frameWrapper1}>
                                                <img
                                                    className={styles.frameChild1}
                                                    loading="lazy"
                                                    alt=""
                                                    src="/group-439.svg"
                                                />
                                            </div>
                                            <div className={styles.frameParent3}>
                                                <img
                                                    className={styles.frameChild2}
                                                    loading="lazy"
                                                    alt=""
                                                    src="/group-441.svg"
                                                />
                                                <div className={styles.dPLQuestionPair}>
                                                    {/* <Link href="/request-now-page1"> */}
                                                    <b className={styles.whatIsDpl2} onClick={handleBookNow}>Book Now</b>
                                                    {/* </Link> */}
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className={styles.xmlid2Group}>
                                            <FrameComponent1
                                                rectangle34="/rectangle-341.svg"
                                                group445="/group-445.svg"
                                                group442="/group-441.svg"
                                                wHATISDPL=" Report Issue"
                                            />
                                        </div> */}
                                    </div>
                                    <div className={styles.frameParent4}>
                                        <div className={styles.vectorGroup}>
                                            <img
                                                className={styles.frameInner}
                                                alt=""
                                                src="/rectangle-341.svg"
                                            />
                                            <div className={styles.frameWrapper2}>
                                                <div className={styles.frameParent5}>
                                                    <img
                                                        className={styles.frameChild3}
                                                        loading="lazy"
                                                        alt=""
                                                        src="/group-405.svg"
                                                    />
                                                    <div className={styles.frameParent6}>
                                                        <img
                                                            className={styles.frameChild4}
                                                            alt=""
                                                            src="/group-439-1.svg"
                                                        />
                                                        <img
                                                            className={styles.frameIcon}
                                                            alt=""
                                                            src="/frame2.svg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.frameParent7}>
                                                <img
                                                    className={styles.frameChild2}
                                                    loading="lazy"
                                                    alt=""
                                                    src="/group-441.svg"
                                                />
                                                <div className={styles.dPLQuestionPair}>
                                                    {/* <Link href="/addreview"> */}
                                                    <b className={styles.whatIsDpl2}>Add Review</b>
                                                    {/* </Link> */}
                                                </div>
                                            </div>
                                        </div>
                                        {/* <FrameComponent1
                                            propGap="20.9px"
                                            rectangle34="/rectangle-341.svg"
                                            propHeight="42.1px"
                                            group445="/group-446.svg"
                                            propHeight1="42.1px"
                                            group442="/group-441.svg"
                                            wHATISDPL="Contact Us"
                                            propMinWidth="67px"
                                        /> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer part is this  */}
                {/* <CustomFooter /> */}
            </div>
        </>
    )
}

export default MainPage