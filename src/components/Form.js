import React from "react";
import { nanoid } from 'nanoid'
import { getDatabase, child, ref, set, get } from "firebase/database";
import { isWebUrl} from 'valid-url';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longUrl: "",
      preferedAlias: "",
      generatedURL: "",
      errors: [],
      loading: false,
      errorMessage: {},
      ToolTipMessage: "Copy to Clipboard",
    };
  }

  onSubmit = async (event) => {
    event.preventDefualt(); // prevents the page from reloading when submit is clicked
    this.setState({
      loading: true,
      generatedURL: "",
    });
// comment
    var isFormValid = await this.validateInput();
    if (!isFormValid) {
      return;
    }
    var generatedKey = nanoid(5);
    var generatedURL = "tinylinks.com/" + generatedKey;

    if (this.state.preferedAlias !== "") {
        generatedKey = this.state.preferedAlias;
        generatedURL = "tinylinks.com/" + generatedKey; 
     }
     const db = getDatabase();
     set(ref(db, '/' + generatedKey), {
        generatedKey: generatedKey,
        longURL: this.state.longURL,
        preferedAlias: this.state.preferedAlias,
        generatedURL: generatedURL,
     }).then((result) => {

        this.setState({
            generatedURL: generatedURL,
            loading: false,
        })
     }).catch((e) => {
        //Handle Error
     })     
  
};
    // Checks if field has an error
    hasError = (key) =>{
        return this.state.errors.indexOf(key) !== -1;
    }

    handleChange = (e) => {
        const { id ,value } = e.target;
        this.setState(prevState => ({
            ...prevState,
            [id]: value,
        }))
    }
    validateInput = async () => {
        var errors = [];
        var errorMessages = this.state.errorMessage;
        // Validated long URL
        if (this.state.longUrl.length ===0){
            errors.push("longURL");
            errorMessages["longURL"] = "Please enter your URL!";

        }
        else if (!isWebUrl(this.state.longURL)) {
            errors.push("longURL");
            errorMessages["longURL"] ='Please enter a URL in the form of https://www...';
        }

        // Prefered Alias
        if (this.state.preferedAlias !== ''){
            if (this.state.preferedAlias.length > 7){
                errors.push("suggestedAlias");
                errorMessages["suggestAlias"] = "Please enter an alias that is less than 7 characters";
            }
            else if (this.state.preferedAlias.indexOf(' ') >=0){
                errors.push("suggestedAlias");
                errorMessages["suggestedAlias"] = "Spaces are not allowed in URLS";
            }
            
            var keyExists = await this.checkKeyExists()

            if (keyExists.exists()){
                errors.push("suggestedAlias");
                errorMessages["suggestedAlias"] = "Alias already exists! Please enter another one :)";
            }
        }
        this.setState({
            errors: errors,
            errorMessages: errorMessages,
            loading: false
        })

        if (errors.length > 0){
            return false;
        }
        return true; 

    }
    checkKeyExists = async () => {
        const dbRef = ref(getDatabase());
        return get(child(dbRef, `/${this.state.preferedAlias}`)).catch((error) => {
            return false
        });
    }

    copyToClipBoard = () =>{
        navigator.clipboard.writeText(this.state.generatedURL)
        this.setState({
            ToolTipMessage: "Copied"
        })
    }

    render() {
        return (
            <div className="container">
                <form autoComplete="off">
                    <h3>Mini Link It!</h3>

                    <div className="form-group">
                        <label>Enter Your Long URL</label>
                        <input
                            id="longURL"
                            onChange={this.handleChange}
                            value={this.state.longURL}
                            type="url"
                            required
                            className={
                                this.hasError("longURL")
                                    ? "form-control is-invalid"
                                    : "form-control"
                            }
                            placeholder="https://www..."
                        />
                    </div>
                    <div
                        className={
                            this.hasError("longURL") ? "text-danger" : "visually-hidden"
                        }
                    >
                        {this.state.errorMessage.longURL}
                    </div>

                    <div className="form-group">
                        <label htmlFor="basic-url">Your Mini URL</label>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text">minilinkit.com/</span>
                            </div>
                            <input
                                id="preferedAlias"
                                onChange={this.handleChange}
                                value={this.state.preferedAlias}
                                className={
                                    this.hasError("preferedAlias")
                                        ? "form-control is-invalid"
                                        : "form-control"
                                }
                                type="text" placeholder="eg. 3fwias (Optional)"
                            />
                        </div>
                        <div
                            className={
                                this.hasError("suggestedAlias") ? "text-danger" : "visually-hidden"
                            }
                        >
                            {this.state.errorMessage.suggestedAlias}
                        </div>
                    </div>


                    <button className="btn btn-primary" type="button" onClick={this.onSubmit}>
                        {
                            this.state.loading ?
                                <div>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                </div> :
                                <div>
                                    <span className="visually-hidden spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Mini Link It</span>
                                </div>
                        }

                    </button>

                    {
                        this.state.generatedURL === '' ?
                            <div></div>
                            :
                            <div className="generatedurl">
                                <span>Your generated URL is: </span>
                                <div className="input-group mb-3">
                                    <input disabled type="text" value={this.state.generatedURL} className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                    <div className="input-group-append">
                                        <OverlayTrigger
                                            key={'top'}
                                            placement={'top'}
                                            overlay={
                                                <Tooltip id={`tooltip-${'top'}`}>
                                                    {this.state.toolTipMessage}
                                                </Tooltip>
                                            }
                                        >
                                            <button onClick={() => this.copyToClipBoard()} data-toggle="tooltip" data-placement="top" title="Tooltip on top" className="btn btn-outline-secondary" type="button">Copy</button>

                                        </OverlayTrigger>

                                    </div>
                                </div>
                            </div>
                    }

                </form>
            </div>
        )       
    }
}
export default Form;