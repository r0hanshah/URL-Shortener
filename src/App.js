import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Form from "./components/Form";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Switch>
              <Route exact path="/" component={Form} />
              <Route path="/App" component={Form} />
            </Switch>
          </div>
        </div>
      </div>
    </Router>
    // comment
    // comment
    // comments
  );
}

export default App;
