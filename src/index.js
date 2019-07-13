import React, { useEffect } from "react";
import { render } from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import "./index.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import axios from "axios";
import { Button, Alert } from "reactstrap";

import createSagaMiddleware from "redux-saga";
import { takeEvery, call, put } from "redux-saga/effects";

const apiMethod = "https://dog.ceo/api/breeds/image/random";
const initState = {
  image: {
    loading: false,
    url: "",
    error: false
  }
};

const reducer = (state = initState, { type, payload }) => {
  switch (type) {
    case "FETCHING_DATA":
      return { ...state, image: { ...state.image, loading: true } };
    case "SUCCESS_DATA":
      return { ...state, image: { url: payload, loading: false } };
    default:
      return state;
  }
};

// all action creator

const fetchingDataAction = () => ({ type: "FETCHING_DATA" });
const successDataAction = data => ({ type: "SUCCESS_DATA", payload: data });

function* watcherApiDogRequest() {
  yield takeEvery("FETCHING_DATA", apiDogRequest);
}

function* apiDogRequest() {
  const data = yield call(() => {
    return axios.get(apiMethod).then(response => response.data.message);
  });
  yield put(successDataAction(data));
}

// Store
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watcherApiDogRequest);

const Dogger = connect(
  state => state,
  { fetchingDataAction }
)(props => {
  const { url } = props.image;
  const { fetchingDataAction } = props;

  useEffect(() => {
    fetchingDataAction();
  }, [fetchingDataAction]);

  return (
    <>
      <Button
        color="primary"
        className="dog__button-change"
        style={{ fontSize: 20, display: "block" }}
        onClick={() => {
          fetchingDataAction();
        }}
      >
        Update Dog, plz
      </Button>
      <div>
        <img src={url} alt="some pic of dog" height="400" />
      </div>
    </>
  );
});

const App = props => {
  return (
    <Provider store={store}>
      <div className="center">
        <Alert>На этом приложении я ставлю эксперементы на redux-saga</Alert>
        <h1> Get some pic of dogs: </h1>
        <Dogger />
      </div>
    </Provider>
  );
};

render(<App />, document.querySelector("#root"));
