import React from "react";

const SeperatLine = (props: any) => {
  const { title, style={} } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: "rgba(251,255,242,1)",
        marginBottom:"20px",
        ...style,
      }}
    >
      <p style={{ marginRight: "20px"}}>{title}</p>
      <div
        style={{
          flexGrow: 1,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          fontSize:'15px'
        }}
      >
        <hr
          style={{
            width: "100%",
            border: "none",
            height: "2px",
            backgroundColor: "rgba(251,255,242, 1)"
          }}
        />
      </div>
    </div>
  );
};

export default SeperatLine;
