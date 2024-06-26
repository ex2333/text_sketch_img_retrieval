import React, { useState, useEffect, useContext, useRef } from "react";
import { queryContext } from "../contexts/QueryContext";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import TextField from "@material-ui/core/TextField";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import Slider from "@material-ui/core/Slider";
import { DropzoneArea } from "material-ui-dropzone";
import SeperatLine from "../components/SeperatLine";
import { baseColor } from "../utils/color";
import Logo from "./Logo.png";
import DrawingBoard from "../components/DrawingBoard"; // 导入手绘组件

const Setting = (props: any) => {
  const {setImages, loading, setLoading, isMobile} = props;
  const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
      setting: {
        display: "flex",
        flexDirection: "column",
        minWidth: isMobile ? "90%" : "300px",
        padding: "60px 20px",
        borderWidth: "1px",
        backgroundColor: "#1F2023",
        color: "#E4E4E6",
        overflowY: "auto",
      },
      header: {
        marginBottom: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      configHead: {
        marginBottom: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      },
      config: {
        fontSize: "24px",
        color: "#FAFAFA",
      },
      clear: {
        color: baseColor,
        fontSize: "18px",
        cursor: "pointer",
      },
      imageSet: {},
      counts: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "15px",
        marginBottom: "10px",
        color: "#808A87",
      },
      currTotal: {
        fontSize: "12px",
      },
      setPath: {
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        marginBottom: "30px",
      },
      customInput: {
        margin: "0 20px 0 0 !important",
        color: "blue !important",
        width: isMobile ? "80%" : "auto",
      },
      textQueryInput: {
        margin: "0 15px 0 0 !important",
        color: "blue !important",
        width: "100%",
      },
      customFab: {
        color: "#fff",
        backgroundColor: baseColor,
        width: "36px",
        height: "36px",
        "&:hover": {
          backgroundColor: baseColor,
        },
      },
      submitFab: {
        color: "#fff",
        backgroundColor: baseColor,
        width:  "97%",
        height: "36px",
        "&:hover": {
          backgroundColor: baseColor,
        },
        marginBottom: "20px",
      },
      customDeleteFab: {
        position: "absolute",
        top: "5px",
        right: "5px",
        color: "#fff",
        backgroundColor: "#666769",
        width: "24px",
        height: "24px",
        minHeight: "0px",
        "&:hover": {
          backgroundColor: "#666769",
        },
      },
      customDelete: {
        color: "#A7A7AF",
        width: "18px",
        height: "18px",
      },
      customIcon: {
        color: "#fff",
        backgroundColor: baseColor,
        width: "20px",
        height: "20px",
      },
      customSlider: {
        color: baseColor,
        marginBottom: "30px",
      },
      thumb: {
        width: "16px",
        height: "16px",
      },
      track: {
        height: "4px",
        borderRadius: "10px",
      },
      upload: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      benchImage: {
        width: "400px",
        height: "250px",
        position: "relative",
      },
      dropzoneContainer: {
        backgroundColor: "transparent",
        width: "390px",
        height: "300px",
        borderRadius: "10px",
        border: "solid .5px #C8C8C8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      dropzoneText: {
        fontSize: "14px",
        color: "#B3B4B5",
        marginBottom: "10px",
      },
      notchedOutline: {
        borderWidth: ".5px",
        borderColor: "#838385 !important",
      },
      formLabel: {
        color: "#fff",
      },
      controlLabel: {
        color: "#838385",
      },
    });
  });
  const { process, train, count, search, clearAll } = useContext(queryContext);
  const classes = useStyles({});
  const [inputs, setInputs]: any = useState("");
  const [textQuery, setTextQuery]: any = useState("");
  const [topK, setTopK]: any = useState(8);
  const [totalNum, setTotalNum]: any = useState(0);
  const [[current, total], setProcessedNum]: any = useState([0, 0]);
  const [image, setImage]: any = useState();
  const [ifUpload, setIfUpload]: any = useState(false);

  const benchImage = useRef<any>(null);
  const setText = loading
    ? "Loading..."
    : totalNum
    ? `${totalNum} images in this set`
    : "No image in this set";

  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      if (benchImage.current) {
        benchImage.current.src = reader.result;
      }
    },
    false
  );

  const _search = ({ topK, image, textQuery }: any) => {
    const fd = new FormData();
    fd.set("topk", topK);
    fd.append("image", image ? image : "");
    fd.set("text_query", textQuery)
    search(fd).then((res: any) => {
      const { status, data } = res || {};
      if (status === 200) {
        setImages(data);
      }
    });
  };

  const onImgUpload = (file: any) => {
    setImage(file);
    reader.readAsDataURL(file);
    // _search({ topK, image: file, textQuery: textQuery });
  };

  const onSketchUpload = (file: any) => {
    setImage(file);
    reader.readAsDataURL(file);
    // _search({ topK, image: file, textQuery: textQuery });
  };

  const doSearch = () => {
    _search({topK, image: image, textQuery: textQuery});
  }

  const onInputChange = (e: any) => {
    const val = e.target.value;
    setInputs(val);
  };

  const onTextQueryInputChange = (e: any) => {
    const val = e.target.value;
    setTextQuery(val);
  };

  const onTopKChange = (e: any, val: any) => {
    setTopK(val);
  };

  const onSwitchClick = () => {
    setIfUpload(!ifUpload);
    setImage();
  }

  const uploadImgPath = () => {
    setLoading(true);
    train({ File: inputs }).then((res: any) => {setInputs(""); setLoading(false); countImages()});
  };

  const clear = () => {
    clearAll().then((res: any) => {
      if (res.status === 200) {
        setProcessedNum([0, 0]);
        setTotalNum(0);
        setImage();
        setImages([]);
      }
    });
  };

  const countImages = () => {
    count().then((res: any) => {
      const { data, status } = res || {};
      if (status === 200) {
        setTotalNum(data);
      }
    });
  }

  useEffect(() => {
    countImages();
  }, []);

  return (
    <div className={classes.setting}>
      <div className={classes.header}>
        <img src={Logo} width="100px" alt="logo" style={{marginBottom: "10px"}}/>
        <p>Image Retrieval with Text and Sketch</p>
      </div>
      <div className={classes.configHead}>
        <h4 className={classes.config}>Config</h4>
        <h4 className={classes.clear} onClick={clear}>
          CLEAR ALL
        </h4>
      </div>
      <SeperatLine title={`Setup Image Set`} style={{ marginBottom: "0px" }} />
      <div className={classes.imageSet}>
        <div className={classes.counts}>
          <p style={{ color:  "#808A87" }}>{setText}</p>
          {/* <h3 className={classes.currTotal}>{`${current}/${total}`}</h3> */}
          {/* <h3 className={classes.currTotal}>{loading ? "Loading..." : "Done"}</h3> */}
        </div>
        <div className={classes.setPath}>
          <TextField
            classes={{ root: classes.customInput }}
            label=""
            variant="outlined"
            value={inputs}
            onChange={onInputChange}
            InputLabelProps={{
              shrink: true,
              classes: {
                root: classes.controlLabel,
                focused: classes.controlLabel,
              },
            }}
            margin="normal"
            InputProps={{
              style: {
                textAlign: "left",
                width: isMobile ? "100%" : "340px",
                height: "40px",
              },
              classes: {
                notchedOutline: classes.notchedOutline,
                root: classes.formLabel,
              },
              placeholder: "path/to/your/images",
            }}
          />
          <Fab
            classes={{
              root: classes.customFab,
              focusVisible: classes.customFab,
            }}
          >
            <AddIcon
              onClick={uploadImgPath}
              classes={{ root: classes.customIcon }}
            />
          </Fab>
        </div>
        <SeperatLine title={`Query Setting`} style={{ marginBottom: "15px" }} />
        <div className={classes.counts}>
          <p style={{ color: "#808A87" }}>{`Show top ${topK} results`}</p>
        </div>
        <Slider
          min={1}
          max={100}
          value={topK}
          onChange={onTopKChange}
          classes={{
            root: classes.customSlider,
            track: classes.track,
            rail: classes.track,
            thumb: classes.thumb,
          }}
          style={{marginBottom: "10px"}}
        />
      </div>
      <div style={{textAlign: "center"}}>
        <Fab
              classes={{
                root: classes.submitFab,
                focusVisible: classes.submitFab,
              }}
              variant="extended"
              onClick={doSearch}
            >
              Submit
        </Fab>
      </div>
      <div className={classes.setPath} style={{justifyContent: "center", marginBottom: "29px"}}>
          <TextField
            classes={{ root: classes.textQueryInput }}
            style={{width: "73%"}}
            label=""
            variant="outlined"
            value={textQuery}
            onChange={onTextQueryInputChange}
            InputLabelProps={{
              shrink: true,
              classes: {
                root: classes.controlLabel,
                focused: classes.controlLabel,
              },
            }}
            margin="normal"
            InputProps={{
              style: {
                textAlign: "left",
                width: "100%",
                height: "40px",
              },
              classes: {
                notchedOutline: classes.notchedOutline,
                root: classes.formLabel,
              },
              placeholder: "Text Query",
            }}
          />
          <Fab
              style={{
                color: "#fff",
                backgroundColor: "gray",
                width:  "20%",
                height: "36px",
                marginLeft: "5px"
              }}
              variant="extended"
              onClick={onSwitchClick}
          >
            Switch
          </Fab>
      </div>
      <div className={classes.upload} style={{ display: "flex", flexDirection: "column"}}>
        <div>
          {image && ifUpload ? (
              <div className={classes.benchImage}>
                <img
                    ref={benchImage}
                    className={classes.benchImage}
                    src={image}
                    alt="..."
                />
                <Fab
                    color="primary"
                    aria-label="add"
                    size="small"
                    classes={{ root: classes.customDeleteFab }}
                >
                  <CloseIcon
                      onClick={() => {
                        setImage();
                        setImages([]);
                      }}
                      classes={{ root: classes.customDelete }}
                  />
                </Fab>
              </div>
          ) : ifUpload ? (
              <DropzoneArea
                  acceptedFiles={["image/*"]}
                  filesLimit={1}
                  dropzoneText={`click to upload / drag a image here`}
                  onDrop={onImgUpload}
                  dropzoneClass={classes.dropzoneContainer}
                  showPreviewsInDropzone={false}
                  dropzoneParagraphClass={classes.dropzoneText}
              />
          ): (
            <DrawingBoard onUpload={onSketchUpload} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Setting;
