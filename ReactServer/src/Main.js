import React, { Component } from 'react';
//Calling Firebase config setting to call the data
import firebase from './Firebase';
import './style.css';

class Main extends Component {

  /* Define a constructor containing the arrays that will be defined later. */
  constructor(props) {
    super(props);
    this.state = {
      rentalsList: [],
      cleanList: []
    }
  }

  /* Functions made as the server mounts. Takes data from Firebase database brand
      fills the local array(rentalsList) with those data.
      Then, fills another array(cleanList) with only the rentals which have been
      already rented and ended, discarding the unused rentals. */
 componentDidMount() {
      firebase.database().ref("RENTALS").on("value", snapshot => {
        let rentalList = [];
        snapshot.forEach(snap => {
            rentalList.push(snap.val());
        });
        this.setState({ rentalsList: rentalList });

        let cleanlista = [];
        rentalList.map((data, key) => {
            if (data.Renter !== '') {
              cleanlista.push(rentalList[key]);
            }
        })
        cleanlista.reverse();
        this.setState({ cleanList: cleanlista });
      });

 }

  /* Render the react server in html code.
      Takes in input the array(cleanList) containing only the rentals which have been rented
      or ended. */
  render() {
    return (
      <div>

        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="./"
            target="_blank"
            rel="noopener noreferrer">
            Rebis DApp - Mobile App
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-secondary"></small>
            </li>
          </ul>
        </nav>


        <div className="container-fluid mt-5">
          <div className="row">
            <div className="content mr-auto ml-auto">
              {this.state.cleanList.map((data, key) => {
                let venditore = data.Renter.split("#@&@#");
                let consumatore = data.Customer.split("#@&@#");

                return (
                  <div className="card mb-4" key={key}>

                    <div className="card-header">
                      <p id="small-forme-edable">
                            {venditore[0].toUpperCase()} </p>
                    </div>

                    <ul id="rentalsList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <div>
                          <p id="font-per-body">Customer:</p>
                          <p id="scndfont-per-body">{consumatore[0]}</p>
                        </div>
                        <div>
                          <p id="font-per-body">Fee:</p>
                          <p id="scndfont-per-body">{data.Fee}</p>
                        </div>
                        <div>
                          <p id="font-per-body">Deposit:</p>
                          <p id="scndfont-per-body">{data.Deposit}</p>
                        </div>
                        <div>
                          <p id="font-per-body">Days:</p>
                          <p id="scndfont-per-body">{data.Days}</p>
                        </div>
                        <div>
                          <p id="font-per-body">Date:</p>
                          <p id="scndfont-per-body">{data.Date}</p>
                        </div>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small id="small-status">
                          STATE: {data.State.toUpperCase()}
                        </small>
                      </li>
                    </ul>

                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default Main;
