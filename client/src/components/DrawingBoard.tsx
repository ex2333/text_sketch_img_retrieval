import React, { useState, useRef, useEffect } from "react";
import Fab from "@material-ui/core/Fab";

const DrawingBoard = ({ onUpload }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);

    useEffect(() => {
        if (!isDrawing && currentPath.length) {
            setPaths((prevPaths) => [...prevPaths, currentPath]);
            setCurrentPath([]);
        }
    }, [isDrawing, currentPath]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setCurrentPath([{ x, y }]);
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
        setCurrentPath((prevPath) => [...prevPath, { x, y }]);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        uploadDrawing();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPaths([]);
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

    const undoLastPath = () => {
        setPaths((prevPaths) => {
            const newPaths = prevPaths.slice(0, -1);
            redrawCanvas(newPaths);
            return newPaths;
        });
    };

    const redrawCanvas = (paths) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        paths.forEach((path) => {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach(point => {
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            });
        });
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
            <div style={{ marginTop: "10px", display: "flex"}}>
                <Fab color="primary" variant="extended" onClick={undoLastPath} style={{ width: "70px", height: "40px", marginBottom: "10px", marginLeft: "220px", backgroundColor: "#006400" }}>
                    Undo
                </Fab>
                <Fab color="secondary" variant="extended" onClick={clearCanvas} style={{ width: "70px", height: "40px", marginBottom: "10px", marginLeft: "10px", backgroundColor: "#BC8F8F" }}>
                    Clear
                </Fab>
            </div>
        </div>
    );
};

export default DrawingBoard;
