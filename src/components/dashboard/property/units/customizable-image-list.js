import React, { useEffect, useState } from "react";

import TaskIcon from "@mui/icons-material/Task";
import { Divider, ImageList } from "@mui/material";
import { ImageModal } from "./image-modal";
import {
	DefaultBadge,
	ImageEditor,
	StyledImage,
	StyledImageListItem,
	StyledTypography,
	TaskBadge,
} from "./styled-components";
import { getImageTypes } from "./units.util";

export const CustomizableImageList = (props) => {
	const { files } = props;
	const [showAllPictures, setShowAllPictures] = useState(false);

	const updateShowAll = () => setShowAllPictures(!showAllPictures);

	return (
		<>
			<ImageEditor>
				<ImageList key="Subheader" cols={6} gap={10}>
					{files?.length
						? files.map((file, index) => {
								return (
									<DisplayImage
										{...props}
										files={files}
										file={file}
										index={index}
										key={index}
										updateShowAll={updateShowAll}
										showAllPictures={showAllPictures}
									/>
								);
						  })
						: null}
				</ImageList>

				{files?.length > 6 && (
					<StyledTypography
						variant="caption"
						component="div"
						onClick={() => setShowAllPictures(!showAllPictures)}
					>
						{showAllPictures ? "Hide" : "See All"} Pictures
					</StyledTypography>
				)}
			</ImageEditor>
			<Divider sx={{ margin: "1rem auto" }} />
		</>
	);
};

const DisplayImage = (props) => {
	const { files, file, index, showAllPictures } = props;
	const [openModal, setOpenModal] = useState(false);
	const [imageType, setImageType] = useState([]);

	const toggleModal = () => setOpenModal(!openModal);

	useEffect(() => {
		setImageType(getImageTypes(files, file, index));
	}, [files]);

	return (
		<>
			{(index <= 5 || showAllPictures) && (
				<StyledImageListItem key={index} onClick={toggleModal}>
					{imageType?.map((type, index) => {
						if (type === "DEFAULT") {
							return (
								<DefaultBadge
									key={index}
									badgeContent="DEFAULT"
									color="primary"
								/>
							);
						}
						if (type === "TASK") {
							return (
								<TaskBadge
									key={index}
									badgeContent={<TaskIcon />}
									color="primary"
								/>
							);
						}
						return null;
					})}
					<StyledImage src={file.url} alt={file.title} />
				</StyledImageListItem>
			)}

			{openModal && (
				<ImageModal
					{...props}
					currentStatus={openModal}
					toggleEditing={toggleModal}
					imageType={imageType}
				/>
			)}
		</>
	);
};
