import createZustand from "zustand";
import create from "zustand/vanilla";
import { persist } from "zustand/middleware";
import localforage from "localforage";

const vanillaStore = create(
  persist(
    (set, get) => ({
      notifications: [],
    }),
    {
      name: "v-inspect-zustand",
      getStorage: () => localforage,
    }
  )
);

const useNotificationStore = createZustand(vanillaStore);

const { getState, setState } = vanillaStore;

export default useNotificationStore;
export { getState, setState };
