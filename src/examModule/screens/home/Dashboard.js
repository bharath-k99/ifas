// Summary: Dashboard Component used to display information for loggedIn user.
// Created: 11/10/2019 05:35 PM - NS (IN)
import React, {Component} from 'react';
import { Alert } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

//Actions

// Components
import HomeJSXText from '../../components/dashboard/Home';

class Dashboard extends Component {

	constructor(props){
		super(props);
		this.methodGoToExam = this.methodGoToExam.bind(this);
	}

	methodGoToExam(title){
		let param = title == 'Online_Test' ? 'no' : 'yes';
		//let navigateToScreen = title == 'Back' ? 'Sessions': 'TestGuide';
		let navigateToScreen = title == 'Back' ? 'LandingScreen': 'TestGuide';
		this.props.navigation.navigate(navigateToScreen, { item: param });
  	}
  
  	render () {
    	return (
      		<HomeJSXText 
			  methodGoToExamProps = { this.methodGoToExam }
			/>
    	);
  	}
}

// this will dispatch the control to fetchLoginAccessToken.
function mapDispatchToProps(dispatch) {
    return {
    };
}

//mapStateToProps is used for selecting the part of the data from the store that the connected component needs.
const mapStateToProps = ( state ) => {

  return { 
    
  };
}

/*
As the first argument passed in to connect, mapStateToProps is used for selecting the part of the data from the store that the connected component needs. 
It’s frequently referred to as just mapState for short.
*/
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);