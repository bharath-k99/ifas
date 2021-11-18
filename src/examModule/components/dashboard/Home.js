// Summary: This file is dashboard Component which can be used in all modules.
// Created: 11/09/2019 12:00 PM - VS (IN)

import React, { Component } from 'react';
import {
	FlatList,
	Image,
	Text,
	TouchableOpacity,
	View
} from 'react-native';

// Resources
import colors from '../../../resources/colors';
import dimensions from '../../../resources/dimension';

//Stylesheet
import { stylesH, texts } from './style-home';  
import styles from '../../../styles/subject_style.js';

class HomeJSXText extends Component{

	constructor(props){
		super(props);
		this.state = {
			dataSource: [
				'Online_Test',
				'Online_Test_Section',
				'Back'
			]
		}
		this.keyExtractor = this.keyExtractor.bind(this);
	}

	keyExtractor = (item) => {
        return item + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    }
	render(){
		return(
			<View style={{ flex: 1, paddingTop: dimensions.sizeRatio * 12, backgroundColor: colors.sessions_bgtheme }}>

				<FlatList
					data={this.state.dataSource}
					renderItem={({ item }) =>
						<TouchableOpacity
							activeOpacity={.9}
							onPress={() => this.props.methodGoToExamProps(item)} >
							<View
								style={{
									marginVertical: dimensions.sizeRatio * 5, paddingVertical: dimensions.sizeRatio * 15,
									marginHorizontal: dimensions.sizeRatio * 10,
									justifyContent: 'space-between', backgroundColor: 'white',
									borderRadius: dimensions.sizeRatio * 10,
								}}
							>
								<View style={{ flexDirection: 'row' }}>

									<View style={{
										flex: 8.75,
										flexDirection: 'column',
										justifyContent: 'center'
									}}>
										<View style={{ flex: 1, justifyContent: 'center', }}>
											<Text style={Platform.OS == 'ios' ? styles.subjects_name_ios : styles.subjects_name_android}>
												{item}
											</Text>                               
										</View>
									</View>
									<View style={{ flex: 1.25, alignItems: 'center', justifyContent: 'center' }}>
										<Image source={require('../../../images/right_caret.png')} style={styles.indicator_image} />
									</View>
								</View>
							</View>
						</TouchableOpacity>
					}
					keyExtractor={(item, index) => this.keyExtractor(item)}
				/>
			</View>
		//   <View style={stylesH.container}>
		//     <Text style={texts.primary}>  
		//       Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
		//     </Text>
		//     <Text style={texts.primary}>
		//       Lorem Ipsum
		//     </Text>
		//     <Text style={texts.primary}>  
		//       Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
		//     </Text>
		//     <Text style={texts.secondary}>
		//       Lorem Ipsum 
		//     </Text> 
		//     <Text style={texts.third}>
		//       Lorem Ipsum 
		//     </Text>
		//     <Text style={texts.third}>
		//       Lorem Ipsum Lorem Ipsum 
		//     </Text>   
		//   </View>
		);
	}
} 

export default HomeJSXText;



