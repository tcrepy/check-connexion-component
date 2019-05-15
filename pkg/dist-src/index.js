import { LitElement, html, css } from "lit-element/lit-element";
export default class CheckConnexion extends LitElement {
  constructor() {
    super();
    this.tStart = null;
    this.tEnd = null;
    this.image = new Image();
    this.counter = 0;
    this.arrTimes = [];
    this.abortFallback = false;
    this.timeToCount = 3;
    this.threshold = 2000;
    this.offlineTimeout = 2000;
    this.message = "Disconnected";

    this.timeout = () => {};

    this.intervalCheckLatency = 6000;
    this.state = true;
  }

  static get properties() {
    return {
      timeToCount: {
        type: Number
      },
      threshold: {
        type: Number
      },
      offlineTimeout: {
        type: Number
      },
      message: {
        type: Text
      },
      intervalCheckLatency: {
        type: Number
      },
      active: {
        type: Boolean
      }
    };
  }
  /**
   * init the function which observe if user have connexion
   * @param _changeProperty
   */


  firstUpdated(_changeProperty) {
    this.checkConnectivity();
  }
  /**
   *
   * @param {boolean} state of the connexion
   */


  changeConnectivity(state) {
    //fire the event connexion-changed in document
    const event = new CustomEvent('connexion-changed', {
      detail: state
    });
    document.dispatchEvent(event);
    this.changeState(state); //display the div to inform user that they didn't havec connexion

    if (state) {
      clearTimeout(this.timeout);
    }
  }

  changeState(state) {
    if (state !== this.state) {
      this.state = !this.state;
      this.requestUpdate();
    }
  }
  /**
   * function used to check the connexion of users
   */


  checkConnectivity() {
    //users have connexion when they load the page ?
    if (navigator.onLine) {
      this.changeConnectivity(true);
    } else {
      this.timeout = setTimeout(() => {
        this.changeConnectivity(false);
      }, this.offlineTimeout);
    } //event listener online / offline


    window.addEventListener('online', () => {
      this.changeConnectivity(true);
    });
    window.addEventListener('offline', () => {
      this.timeout = setTimeout(() => {
        this.changeConnectivity(false);
      }, this.offlineTimeout);
    }); //timeout in case of the connexion is too slow to load the first request

    this.timeoutCallback(); //check if the connexion is too slow

    this.checkLatency(avg => this.handleLatency(avg));
    setInterval(() => {
      this.reset();
      this.timeoutCallback();
      this.checkLatency(avg => this.handleLatency(avg));
    }, this.intervalCheckLatency);
  }
  /**
   * make an average of time to get an image
   * @param {function} callback
   */


  checkLatency(callback) {
    this.tStart = new Date().getTime();

    if (this.counter < this.timeToCount) {
      //load image use to check the connexion
      this.image.src = "https://www.google.com/images/phd/px.gif?t=" + this.tStart;

      this.image.onload = () => {
        //disabling the fallback timeout
        this.abortFallback = true; //add the time to get the image to an array to make the average

        this.tEnd = new Date().getTime();
        let time = this.tEnd - this.tStart;
        this.arrTimes.push(time);
        this.checkLatency(callback);
        this.counter++;
      }; //if we can't get the image, passing the connectivity to false


      this.image.offline = () => {
        this.timeout = setTimeout(() => {
          this.changeConnectivity(false);
        }, this.offlineTimeout);
      };
    } else {
      //average of times to get images
      const sum = this.arrTimes.reduce((a, b) => a + b);
      const avg = sum / this.arrTimes.length;
      callback(avg);
    }
  }

  timeoutCallback() {
    this.timeout = setTimeout(() => {
      if (!this.abortFallback) {
        console.log('Connectivity is too slow, falling back offline experience');
        this.changeConnectivity(false);
      }
    }, this.threshold + 1);
  }

  reset() {
    this.arrTimes = [];
    this.counter = 0;
  }

  handleLatency(avg) {
    const isConnectedFast = avg <= this.threshold;
    if (!isConnectedFast) return this.changeConnectivity(false);
    this.changeConnectivity(true);
  }

  static get styles() {
    return css`       
            .connexion {
                --check-connexion-font-size: 2vh;
                --check-connexion-background-color: #d00000;
                --check-connexion-text-color: #ffffff;
                --check-connexion-text-transform: uppercase;
                --check-connexion-height: 50px;
            } 
            
            .connexion {
                height: 0;
                opacity: 0;
                position: fixed;
                line-height: var(--check-connexion-height);
                bottom: 0;
                width: 100%;
                background-color: var(--check-connexion-background-color);
                color: var(--check-connexion-text-color);
                text-align: center;
                padding: 5px;
                transition: 1s all ease-in-out;
                overflow: hidden;
            }
            .active {
                height: var(--check-connexion-height);
                opacity: 1;
            }
            .isDisconnected {
                font-size: var(--check-connexion-font-size);
                text-transform: var(--check-connexion-text-transform)
            }
        `;
  }

  render() {
    let classInactive = !this.state ? 'active' : '';
    return html`
            <div class="connexion ${classInactive}">
                <div class="isDisconnected">${this.message}</div>
            </div>
        `;
  }

}
customElements.define('check-connexion', CheckConnexion);