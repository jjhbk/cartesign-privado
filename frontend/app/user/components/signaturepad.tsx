import SignaturePad from "react-signature-canvas";
import { useRef, useState } from "react";
export default function Signature() {
  let padRef: any = useRef({});
  const [dataURL, setDataURL] = useState("");
  const clear = () => {
    padRef.current?.clear();
  };
  const trim = async () => {
    var url = "";
    url = padRef.current?.getCanvas().toDataURL("image/png");
    setDataURL(url);
    console.log(url);
  };
  return (
    <div>
      <div
        style={{
          backgroundColor: "white",
          width: 250,
          marginLeft: 50,
          marginRight: 50,
          alignItems: "center",
          alignContent: "center",
          alignSelf: "center",
        }}
        className="aspect-[3/1]"
      >
        <SignaturePad
          ref={padRef}
          canvasProps={{
            className: "sigCanvas",
            width: 250,
            height: 80,
            color: "red",
          }}
        />
      </div>

      <div className="flex flex-row justify-normal">
        <button
          className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
          onClick={trim}
        >
          Register
        </button>
        <button
          className="bg-red-400 rounded-md p-2 text-sm shadow-sm hover:bg-red-600"
          onClick={clear}
        >
          Clear
        </button>
      </div>
      <div>
        {dataURL ? (
          <img
            className={"sigImage"}
            src={dataURL}
            alt="user generated signature"
          />
        ) : null}
      </div>
    </div>
  );
}
