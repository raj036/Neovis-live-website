import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../config";

export const getUser = () =>
  globalThis.localStorage
    ? JSON.parse(globalThis.localStorage.getItem("vInspection-user"))?.user
    : null;

export const managerLogin = () =>
  globalThis.localStorage
    ? (JSON.parse(
      globalThis.localStorage.getItem("vInspection-user")
    )?.user?.user_role?.role?.toUpperCase() === "MANAGER") || (JSON.parse(
      globalThis.localStorage.getItem("vInspection-user")
    )?.user?.user_role?.role?.toUpperCase() === "OWNER")
    : false;

export const setUser = (user) => {
  if (user) {
    globalThis.localStorage.setItem("vInspection-user", JSON.stringify(user));
  } else {
    globalThis.localStorage.removeItem("vInspection-user");
  }
};

export const removeUser = () =>
  globalThis.localStorage.removeItem("vInspection-user");

export const clearNotifications = () =>
  globalThis.localStorage.removeItem("v-inspect-zustand");

export const getToken = () => {
  return globalThis.localStorage
    ? JSON.parse(globalThis.localStorage.getItem("vInspection-user"))?.token
    : "";
};

export const deleteFirebaseImage = async (imageFolder, image) => {
  // let oldImage = storage.ref(
  //   imageFolder +
  //     "/" +
  //     image
  //       ?.substring(image?.lastIndexOf("%2F") + 3, image?.indexOf("?"))
  //       ?.replaceAll("%20", " ")
  // );
  // if (oldImage) {
  //   await oldImage.delete();
  // }
};

export const uploadFirebaseImage = async (imageFolder, image) => {
  let imageUri;
  const fileName = image._file.name;
  let fileReference = storage.ref(imageFolder + "/" + fileName);

  await fileReference.put(image._file).then(async (taskSnapshot) => {
    if (taskSnapshot.state === "success") {
      await fileReference.getDownloadURL().then((uri) => {
        imageUri = uri;
      });
    }
  });
  return imageUri;
};

// value refers to value to be validated
// name refers to name of the field
// funtion to update state for error handling 
export const validateDescription = (value, name, setDescriptionErr) => {
  // Covert string to html format
  const parser = new DOMParser();
  const htmlString = value;
  const parsedContent = parser.parseFromString(htmlString, 'text/html');
  const childCount = parsedContent.body.childElementCount;

  // Check if textcontent is present 
  if (childCount) {
    const err = [];
    for (let i = 0; i < childCount; i++) {
      // If textcontent present push true else false
      if (parsedContent.body.children[i].textContent?.trim() === '') {
        err.push(true);
      } else {
        err.push(false);
        break;
      }
    }
    // If there is any valid text content set error to false and vice versa
    if (err.includes(false)) {
      setDescriptionErr(prevVal => ({ ...prevVal, [name]: false }));
      return false;
    } else {
      setDescriptionErr(prevVal => ({ ...prevVal, [name]: true }));
      return true;
    }
  }
}
