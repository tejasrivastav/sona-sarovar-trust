export const receivedCenterPics = centerPics => (
  {
    type: "RECEIVED_CENTER_PICS",
    centerPics
  }
);

export const updatedCenterPic = (centerPicIndex, centerPicUrl) => (
  {
    type: "UPDATED_CENTER_PIC",
    centerPicIndex,
    centerPicUrl
  }
);

export const addedCenterPic = centerPic => (
  {
    type: "ADDED_CENTER_PIC",
    centerPic
  }
);

export const deletedCenterPic = centerPicIndex => (
  {
    type: "DELETED_CENTER_PIC",
    centerPicIndex
  }
);

export const receivedCenterPicCaptions = captions => (
  {
    type: "RECEIVED_CENTER_PIC_CAPTIONS",
    captions
  }
);

export const updatedCenterPicCaption = (captionIndex, captionText) => (
  {
    type: "UPDATED_CENTER_PIC_CAPTION",
    captionText,
    captionIndex
  }
);

export const addedCenterPicCaption = caption => (
  {
    type: "ADDED_CENTER_PIC_CAPTION",
    caption
  }
);

export const deletedCenterPicCaption = (captionIndex) => (
  {
    type: "DELETED_CENTER_PIC_CAPTION",
    captionIndex
  }
);

export const receivedMainTexts = (mainTextPara1, mainTextPara2) => (
  {
    type: "RECEIVED_MAIN_TEXTS",
    mainTextPara1,
    mainTextPara2
  }
);
