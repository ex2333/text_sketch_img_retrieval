import React, { useState, useRef } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from "@material-ui/icons/Close";

const DrawingBoard = ({ onUpload }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDrawing = () => {
        setIsDrawing(false);
        uploadDrawing();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const uploadDrawing = () => {
        const canvas = canvasRef.current;
        // const dataURL = canvas.toDataURL("image/png");
        canvas.toBlob((blob) => {
            if (blob) {
                onUpload(blob); // 直接传递二进制数据给 uploadImg 函数
            }
        }, "image/png");
        // setImage(dataURL); // 将绘制的图片路径传递给 uploadImg 函数
    };

    return (
        <div style={{textAlign: "center"}}>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseOut={endDrawing}
                width={390}
                height={300}
                style={{width: "390px", height: "300px", border: "1px solid black", backgroundColor: "#CCE8CF", borderRadius: "10px"}}
            ></canvas>
            <div style={{ marginTop: "10px" }}>
                {/* <Fab color="primary" variant="extended" onClick={uploadDrawing} style={{ width: "70px", height: "40px", marginBottom: "10px", marginLeft: "200px", backgroundColor: "#6B8E23" }}>
                    Finish
                </Fab> */}
                <Fab color="secondary" variant="extended" onClick={clearCanvas} style={{ width: "70px", height: "40px", marginBottom: "10px", marginLeft: "320px", backgroundColor: "#BC8F8F" }}>
                    Clear
                </Fab>
            </div>
        </div>
    );
};

export default DrawingBoard;
