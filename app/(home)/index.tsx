import {
  Button,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { Link, Redirect } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { Car, Order } from "@/src/API";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { createCar, updateCar, updateOrder } from "@/src/graphql/mutations";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import NewOrderPopup from "@/components/NewOrderPopup";
import { getCar, listOrders } from "@/src/graphql/queries";
import * as Location from "expo-location";

const HomeScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const { signOut } = useAuthenticator();
  const dropOffDep = useRef(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [myPosition, setMyPosition] = useState(null);
  const [car, setCar] = useState<Car | null>(null);
  const [newOrders, setNewOrders] = useState([]);
  const client = generateClient();

  const { authStatus, isPending } = useAuthenticator((context) => [
    context.authStatus,
  ]);
  //console.log(authStatus, "index");

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // setErrorMsg();
        //console.warn("Permission to access location was denied");

        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  const onUserLocationChange = async (event: any) => {
    // //console.log("SD", location);
    // //console.log(event.nativeEvent.coordinate);
    const { latitude, longitude, heading } = event.nativeEvent.coordinate;
    // //console.log(
    //   location?.coords.latitude.toFixed(2) !== latitude.toFixed(2) &&
    //     location?.coords.longitude.toFixed(2) !== longitude.toFixed(2)
    // );
    // console.log(location?.coords.latitude.toFixed(2), latitude.toFixed(2));
    // console.log(location?.coords.longitude.toFixed(2), longitude.toFixed(2));
    // Update the car and set it to active
    // return;
    if (
      location?.coords.latitude.toFixed(2) !== latitude.toFixed(2) &&
      location?.coords.longitude.toFixed(2) !== longitude.toFixed(2) &&
      authStatus == "authenticated"
    ) {
      try {
        const { username, userId, signInDetails } = await getCurrentUser();
        // //console.log(await getCurrentUser());
        const input = {
          id: userId,
          latitude,
          longitude,
        };
        // const updatedCarData = await API.graphql(
        //   graphqlOperation(updateCar, { input })
        // );

        const result = await client.graphql({
          query: updateCar,
          authMode: "apiKey",

          // authToken:'',
          variables: {
            // @ts-ignore
            input: input,
          },
        });

        //@ts-ignore
        setCar(result.data.updateCar);
      } catch (e) {
        //console.error(e);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const result = await client.graphql({
        query: listOrders,
        authMode: "apiKey",

        // authToken:'',
        variables: {
          // @ts-ignore

          filter: { status: { eq: "NEW" } },
        },
      });
      //console.log(result.data.listOrders.items);

      // @ts-ignore
      setNewOrders(result.data.listOrders.items);
    } catch (e) {
      //console.log(e);
    }
  };

  const fetchCar = async () => {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();

      const result = await client.graphql({
        query: getCar,
        authMode: "apiKey",

        // authToken:'',
        variables: {
          // @ts-ignore
          id: userId,
        },
      });
      //@ts-ignore
      setCar(result.data.getCar);
      //console.warn("s", result.data.getCar);
    } catch (e) {
      //console.error(e);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") {
      const updateUserCar = async () => {
        //Get auth user

        // const authUser = await Auth.currentAuthenticatedUser({
        //   bypassCache: true,
        // });
        const { username, userId, signInDetails } = await getCurrentUser();
        if (!userId) {
          return;
        }

        //Check if user has car
        // const carData = await API.graphql(
        //   graphqlOperation(getCarId, { id: authUser.attributes.sub })
        // );

        const carData = await client.graphql({
          query: getCar,
          authMode: "apiKey",

          // authToken:'',
          variables: {
            // @ts-ignore
            id: userId,
          },
        });

        if (!!carData.data.getCar) {
          //console.log("User has a car");
          return;
        }

        // if not car create a car
        const newCar = {
          id: userId,
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,

          userId: userId,
        };

        //await API.graphql(graphqlOperation(createCar, { input: newCar }));

        await client.graphql({
          query: createCar,
          authMode: "apiKey",

          // authToken:'',
          variables: {
            // @ts-ignore
            input: newCar,
          },
        });
      };

      updateUserCar();
    }
  }, []);

  useEffect(() => {
    if (authStatus == "authenticated") {
      fetchCar();
      fetchOrders();
    }
  }, [authStatus]);

  const onDecline = () => {
    setNewOrders(newOrders.slice(1));
  };

  const onAccept = async (newOrder: any) => {
    try {
      const input = {
        id: newOrder.id,
        status: "DELIVERING",
        //@ts-ignore
        carId: car.id,
      };

      const result = await client.graphql({
        query: updateOrder,
        authMode: "apiKey",

        // authToken:'',
        variables: {
          // @ts-ignore
          input: input,
        },
      });
      setOrder(result.data.updateOrder);
    } catch (e) {
      //console.warn(e);
    }

    setNewOrders(newOrders.slice(1));
  };

  const onDropOff = async () => {
    try {
      const input = {
        id: order?.id,
        status: "DROPPING_OFF",
      };

      const result = await client.graphql({
        query: updateOrder,
        authMode: "apiKey",

        // authToken:'',
        variables: {
          // @ts-ignore
          input,
        },
      });

      setOrder(result.data.updateOrder);
      return;
    } catch (e) {
      //console.warn(e);
    }
  };

  useEffect(() => {
    if (order?.status !== "DROPPING_OFF") {
      onDropOff();
    }
  }, [dropOffDep.current]);

  // const getDestination = () => {
  //   if (order ) {
  //     return {
  //       latitude: order.destLatitude,
  //       longitude: order.destLongitude,
  //     };
  //   }
  //   return {
  //     latitude: order.originLatitude,
  //     longitude: order.oreiginLongitude,
  //   };
  // };

  const renderBottomStatus = () => {
    // if (order && order.isFinished) {
    //   return (
    //     <View style={{ alignItems: "center" }}>
    //       <Pressable
    //         // onPress={onComplete}
    //         style={{
    //           flexDirection: "row",
    //           alignItems: "center",
    //           justifyContent: "center",
    //           backgroundColor: "#cb1a1a",
    //           width: 200,
    //           padding: 10,
    //         }}
    //       >
    //         <Text style={{ color: "white", fontWeight: "bold" }}>
    //           COMPLETE ORDER
    //         </Text>
    //       </Pressable>
    //       <Text style={styles.bottomText}>{order?.user?.username}</Text>
    //     </View>
    //   );
    // }

    if (order) {
      return (
        <View style={{ alignItems: "center" }}>
          <Text
            style={[styles.bottomText, { fontWeight: "normal", fontSize: 20 }]}
          >
            Delivering to {order?.user?.name}
          </Text>
          <Text
            style={[styles.bottomText, { fontWeight: "normal", fontSize: 20 }]}
          >
            Order Status {order?.status}
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView>
      <View>
        {
          <Text>
            {location?.coords.latitude} s {order?.destLatitude}
          </Text>
        }
        {location?.coords.latitude ? (
          <MapView
            style={{
              height: Dimensions.get("window").height - 125,
              width: "100%",
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onUserLocationChange={onUserLocationChange}
            initialRegion={{
              latitude: location?.coords.latitude,
              longitude: location?.coords.longitude,
              latitudeDelta: 0.0221,
              longitudeDelta: 0.0121,
            }}
          >
            {order && (
              <Marker
                coordinate={{
                  latitude: order?.destLatitude,
                  longitude: order?.destLongitude,
                }}
                title={"title"}
                description={"description"}
              />
              // <Marker
              //   origin={{
              //     latitude: car?.latitude,
              //     longitude: car?.longitude,
              //   }}
              //   onReady={onDirectionFound}
              //   destination={getDestination()}
              //   apikey={GOOGLE_API_KEY}
              //   strokeWidth={5}
              //   strokeColor="black"
              // />
            )}
          </MapView>
        ) : null}

        {/* <Pressable
          onPress={() => {
            //console.warn("Online");
          }}
          style={[styles.roundBtn, { top: 10, left: 10 }]}
        >
          <Entypo name={"menu"} size={30} color={"#4a4a4a"} />
        </Pressable> */}

        {/* <Pressable
        onPress={() => {
          //console.warn('Online');
        }}
        style={[styles.roundBtn, {top: 10, right: 10}]}>
        <Ionicons name={'search'} size={30} color={'#4a4a4a'} />
      </Pressable> */}

        {/* <Pressable
          onPress={() => {
            //console.warn("Online");
          }}
          style={[styles.roundBtn, { bottom: 120, left: 10 }]}
        >
          <Entypo name={"shield"} size={30} color={"#1495ff"} />
        </Pressable> */}

        {/* {!order && (
          <Pressable onPress={onGoPress} style={styles.goBtn}>
            <Text style={styles.goText}>{car?.isActive ? "END" : "GO"}</Text>
          </Pressable>
        )} */}

        <Pressable
          onPress={async () => {
            signOut();
          }}
          style={[
            styles.roundBtn,
            {
              bottom: 120,
              right: 10,
              backgroundColor: "red",
              paddingLeft: 12,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={"logout"}
            size={30}
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
            color={"white"}
          />
        </Pressable>

        <View style={styles.bottomContainer}>
          {/* <Ionicons name={"options"} size={30} color={"#4a4a4a"} /> */}
          {renderBottomStatus()}

          {/* <Entypo name={"menu"} size={30} color={"#4a4a4a"} /> */}
        </View>

        {newOrders.length > 0 && !order && (
          <NewOrderPopup
            newOrder={newOrders[0]}
            duration={2}
            distance={0.5}
            onDecline={onDecline}
            onAccept={() => onAccept(newOrders[0])}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

export const styles = StyleSheet.create({
  bottomContainer: {
    height: 100,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  bottomText: {
    fontSize: 22,
    color: "#4a4a4a",
    fontWeight: "bold",
  },
  roundBtn: {
    position: "absolute",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 25,
  },
  goBtn: {
    position: "absolute",
    backgroundColor: "#1495ff",
    padding: 10,
    borderRadius: 40,
    width: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    bottom: 120,
    left: Dimensions.get("window").width / 2 - 37,
  },
  goText: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },
  balanceBtn: {
    position: "absolute",
    backgroundColor: "#1c1c1c",
    width: 100,
    height: 50,
    borderRadius: 25,

    justifyContent: "center",
    alignItems: "center",
    top: 10,
    left: Dimensions.get("window").width / 2 - 50,
  },
  balancetext: {
    fontSize: 23,
    color: "white",
    fontWeight: "bold",
    marginRight: 5,
  },
});
