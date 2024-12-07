/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createCar = /* GraphQL */ `mutation CreateCar(
  $input: CreateCarInput!
  $condition: ModelCarConditionInput
) {
  createCar(input: $input, condition: $condition) {
    id
    latitude
    longitude
    orders {
      nextToken
      __typename
    }
    userId
    user {
      id
      username
      email
      name
      createdAt
      updatedAt
      userCarId
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCarMutationVariables,
  APITypes.CreateCarMutation
>;
export const updateCar = /* GraphQL */ `mutation UpdateCar(
  $input: UpdateCarInput!
  $condition: ModelCarConditionInput
) {
  updateCar(input: $input, condition: $condition) {
    id
    latitude
    longitude
    orders {
      nextToken
      __typename
    }
    userId
    user {
      id
      username
      email
      name
      createdAt
      updatedAt
      userCarId
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCarMutationVariables,
  APITypes.UpdateCarMutation
>;

export const updateOrder = /* GraphQL */ `mutation UpdateOrder(
  $input: UpdateOrderInput!
  $condition: ModelOrderConditionInput
) {
  updateOrder(input: $input, condition: $condition) {
    id
    destLatitude
    destLongitude
    status
    calories
    userId
    user {
      id
      username
      email
      name
      createdAt
      updatedAt
      userCarId
      __typename
    }
    carId
    car {
      id
      latitude
      longitude
      userId
      createdAt
      updatedAt
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateOrderMutationVariables,
  APITypes.UpdateOrderMutation
>;
