class CurrentLocation extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.loc === null) {
      return <div className="location">&emsp;</div>
    }
    return (
      <div className="location">
        You are currently in {this.props.loc}
      </div>
    );
  }
};


class Spinner extends React.Component {
  render() {
    return <div className="spinner"></div>;
  }
};

class ISSButton extends React.Component {
  render() {
    var button = <div className="next-encounter-button" onClick={this.props.handleClick}>Get Next Encounter</div>;
    return this.props.loading ? <Spinner /> : button;
  }
}

class NextEncounter extends React.Component {
  render() {
    if (this.props.encounterTime === null) {
      return  <div className="encounter-text">&emsp;</div>
    }
    var d = new Date(this.props.encounterTime * 1000);
    var secondsTillEncounter = (d.getTime() - (new Date()).getTime()) / 1000;
    var hours = Math.floor(secondsTillEncounter / 60 / 60);
    var minutes = Math.floor((secondsTillEncounter - (hours * 60 * 60)) / 60);
    var seconds = Math.floor(secondsTillEncounter - (hours * 60 * 60) - (minutes * 60));
    var encounterString = "" + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds.";
    return <div className="encounter-text"> Your next ISS Encounter will be in: {encounterString}</div>;
  }
};

class ISSApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {lat: 0, lon: 0, encounterTime: null, loaded: true, formattedLocation: null};
    this.fetchNextEncounter = this.fetchNextEncounter.bind(this);
    this.reverseGeocode = this.reverseGeocode.bind(this);
  }

  fetchNextEncounter() {
    this.setState({loaded: false});
    $.ajax({
      url: "http://api.open-notify.org/iss-pass.json?lat=" + this.state.lat + "&lon=" + this.state.lon + "&callback=?",
      dataType: 'json',
      cache: false,
      success: (data) => {
        this.setState({encounterTime: ($.isArray(data.response)) ? data.response[0].risetime : 0, loaded: true});
      },
      error: (xhr, status, err) => {}
    });
  }

  componentDidMount() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.setState({lat: position.coords.latitude, lon: position.coords.longitude});
          this.reverseGeocode();
        });
    }
  }
  reverseGeocode() {
    $.ajax({
      url: "http://nominatim.openstreetmap.org/reverse?format=json&json_callback=?&lat=" + this.state.lat + "&lon=" + this.state.lon,
      dataType: 'json',
      cache: false,
      success: (data) => {
        this.setState({formattedLocation: data["address"]["county"] + ", " + data["address"]["state"]});
      },
      error: (xhr, status, err) => {}
    });
  }


  render() {
    return (
      <div>
        <CurrentLocation loc={this.state.formattedLocation} />
        <NextEncounter encounterTime={this.state.encounterTime} />
        <ISSButton handleClick={this.fetchNextEncounter} loading={!this.state.loaded}/>
        <br/>
      </div>
    );
  }
};

setInterval(() => {
  React.render(
    <ISSApp />,
    document.getElementById('content')
  );
}, 1000);
