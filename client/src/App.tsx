import React, { useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import QueryProvider from "./contexts/QueryContext";
import Setting from "./containers/Setting";
import SearchResults from "./components/SearchResults";

const App: React.FC = () => {
  const isMobile = !useMediaQuery("(min-width:1000px)");
  const useStyles = makeStyles(() => {
    return createStyles({
      root: {
        flexGrow: 1,
        display: isMobile ? "block" : "flex",
        overflow: isMobile ? "visible" : "hidden",
      },
    });
  });
  const classes = useStyles({});
  const [images, setImages]: any = useState([]);
  const [loading, setLoading]: any = useState(false);
  return (
    <QueryProvider>
      <div className={classes.root}>
        <Setting setImages={setImages} loading={loading} setLoading={setLoading} isMobile={isMobile}/>
        <SearchResults images={images} isMobile={isMobile}/>
      </div>
    </QueryProvider>
  );
};

export default App;
