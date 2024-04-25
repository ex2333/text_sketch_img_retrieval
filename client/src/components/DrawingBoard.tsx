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
        clearCanvas(); // 清空画板
    };

    return (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseOut={endDrawing}
                width={400}
                height={300}
                style={{ border: "1px solid black" }}
            ></canvas>
            <div style={{ marginTop: "10px" }}>
                <Fab color="primary" onClick={uploadDrawing} style={{ marginRight: "10px" }}>
                    <SendIcon />
                </Fab>
                <Fab color="secondary" onClick={clearCanvas}>
                    <CloseIcon />
                </Fab>
            </div>
        </div>
    );
};

export default DrawingBoard;
