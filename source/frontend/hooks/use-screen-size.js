import { useContext } from "react";
import ScreenSizeContext from "../contexts/screen-size";

export default function useScreenSize() {
	return useContext(ScreenSizeContext).size;
}

export function useScreenSizeIndex() {
	return useContext(ScreenSizeContext).index;
}
