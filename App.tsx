import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Text,
	TextInput,
	View,
	Alert,
	TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import React, { useState, useEffect } from "react";
import { Gyroscope } from "expo-sensors";

const credentials = require("./credentials.json");

export default function App() {
	const [msg, setMsg] = useState("");
	const [sts, setSts] = useState(0);
	const [{ x, y, z }, setData] = useState({
		x: 0,
		y: 0,
		z: 0,
	});
	const [subscription, setSubscription] = useState<any>(null);

	const _slow = () => {
		Gyroscope.setUpdateInterval(250);
	};
	const _fast = () => {
		Gyroscope.setUpdateInterval(16);
	};

	const _subscribe = () => {
		setSubscription(
			Gyroscope.addListener((result) => {
				setData(result);
				postExample(result.x, result.y, result.z);
			})
		);
	};

	const _unsubscribe = () => {
		subscription && subscription.remove();
		setSubscription(null);
	};

	useEffect(() => {
		_subscribe();
		return () => _unsubscribe();
	}, []);

	const postExample = async (x:number,y:number,z:number) => {
		try {
			await fetch(`http://${credentials.IP}:${credentials.serverPort}/api`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": `http://${credentials.IP}:${credentials.clientPort}`,
				},
				body: JSON.stringify({
					angle: {
						pitch: x,
						roll: y,
						yaw: z,
					},
				}),
			}).then((response) => {
				response.json().then((data) => {
					console.log(data.createdAt);
				});
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<View style={styles.container}>
			<Text>You wrote: {msg}</Text>
			<Text>Status: {sts}</Text>
			<Text>Gyroscope:</Text>
			<Text>x: {x}</Text>
			<Text>y: {y}</Text>
			<Text>z: {z}</Text>
			<TextInput
				style={{
					height: 40,
					fontSize: 24,
				}}
				defaultValue="Type in me"
				onChangeText={(input) => {
					setMsg(input);
				}}
			/>
      <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
			<TouchableOpacity onPress={_slow}>
				<Text>Slow</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={_fast}>
				<Text>Fast</Text>
			</TouchableOpacity>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
