import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Redirect, router, Stack } from "expo-router";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { getCurrentUser } from "aws-amplify/auth";
import { getCar } from "@/src/graphql/queries";
import { generateClient } from "aws-amplify/api";
import { createCar } from "@/src/graphql/mutations";

const HomeLayout = () => {
  const { authStatus, isPending } = useAuthenticator((context) => [
    context.authStatus,
  ]);

  const client = generateClient();
  if (authStatus === "unauthenticated") {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      {/* <Stack.Screen name="startorder" />
      <Stack.Screen name="orderstatus" /> */}
      {/* <Stack.Screen name="details" /> */}
    </Stack>
  );
};

export default HomeLayout;

const styles = StyleSheet.create({});
