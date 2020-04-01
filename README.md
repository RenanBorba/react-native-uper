## react-native-uper
# Projeto Portfólio - Aplicação Uper Mobile React Native
Aplicação Front-end Mobile desenvolvida em React Native para clone do app Uber com integração com a API Google Maps, voltada para transporte privado urbano, permite a interação do usuário entre seu local de origem e destino.
<ul>
  <li>Expo</li>
  <li>Components</li>
  <li>react-native-maps</li>
  <li>Google Maps Platform API</li>
  <li>react-native-google-places-autocomplete</li>
  <li>styled-components</li>
  <li>Platform</li>
  <li>react-native-google-maps-directions</li>
  <li>PixelRatio</li>
  <li>Marker</li> 
  <li>react-native-geocoding</li>
  <li>State</li>
</ul> 
<br><br> 
 

## src/components/Map/index.js 
```js
import React, { Component, Fragment } from 'react';
import { View, Image } from 'react-native';
//import { MapView } from 'expo';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';

import { getPixelSize } from '../../utils';
import Search from '../Search';
import Directions from '../Directions';
import Details from '../Details';
import markerImage from '../../assets/marker.png';
import backImage from '../../assets/back.png';

import
  {
    Back,
    LocationBox,
    LocationText,
    LocationTimeBox,
    LocationTimeText,
    LocationTimeTextSmall
  } from './styles';

Geocoder.init(" ");

export default class Map extends Component {
  state = {
    region: null,
    destination: null,
    duration: null,
    location: null
  };

  async componentDidMount() {
    // Posição atual do usuário
    navigator.geolocation.getCurrentPosition(
      // Coordenadas da localização do usuário
      async ({ coords: { latitude, longitude } }) => {
        const response = await Geocoder.from({ latitude, longitude });
        const address = response.results[0].formatted_address;
        // endereço mínimo (até a vírgula)
        const location = address.substring(0, address.indexOf(","));

        this.setState({
          location,
          region: {
            latitude,
            longitude,
            latitudeDelta: 0.0143,
            longitudeDelta: 0.0134
          }
        });
      }, //sucesso
      () => {}, //erro
      {
        // Tentar buscar conexão
        timeout: 2000,
        // Localização Gps
        enableHighAccuracy: true,
        // Intervalo busca
        maximumAge: 1000
      }
    );
  }

  handleLocationSelected = (data, { geometry }) => {
    const {
      location: {
        lat: latitude,
        lng: longitude }
    } = geometry;

    this.setState({
      destination: {
        latitude,
        longitude,
        title: data.structured_formatting.main_text
      }
    });
  };

  handleBack = () => {
    this.setState({ destination: null });
  };

  render() {
    const { region, destination, duration, location } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          region={ region }
          showsUserLocation
          loadingEnabled
          // instância mapView
          ref={el => (this.mapView = el)}
        >
          { destination && (
            <Fragment>
              <Directions
                origin={ region }
                destination={ destination }
                onReady={ result => {
                  this.setState({ duration: Math.floor(result.duration) });

                  //ref mapView
                  this.mapView.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: getPixelSize(50),
                      left: getPixelSize(50),
                      top: getPixelSize(50),
                      bottom: getPixelSize(350)
                    }
                  });
                }}
              />
              {/* Marcador destino */}
              <Marker
                /*
                 * Local do marcador
                 * state  -- destination
                 */
                coordinate={ destination }
                // ancorar marcador no centro(x: 0, y: 0) da imagem quadrada
                anchor={{ x: 0, y: 0 }}
                // ref img
                image={ markerImage }
              >
                <LocationBox>
                  {/*
                    * Label destino
                    * state  -- title
                    */}
                  <LocationText>{ destination.title }</LocationText>
                </LocationBox>
              </Marker>

              {/**
                * Marcador origem
                * state -- region, duration, location
                */}
              <Marker coordinate={ region } anchor={{ x: 0, y: 0 }}>
                <LocationBox>
                  <LocationTimeBox>
                    {/* label duração */}
                    <LocationTimeText>{ duration }</LocationTimeText>
                    <LocationTimeTextSmall>MIN</LocationTimeTextSmall>
                  </LocationTimeBox>
                  {/* label origem */}
                  <LocationText>{ location }</LocationText>
                </LocationBox>
              </Marker>
            </Fragment>
          )}
        </MapView>

        {/* se selecionar voltar */}
        { destination ? (
          <Fragment>
            <Back onPress={ this.handleBack }>
              <Image source={ backImage } />
            </Back>
            <Details />
          </Fragment>
        // senão..
        ) : (
          <Search onLocationSelected={ this.handleLocationSelected } />
        )}
      </View>
    );
  }
};
```

<br><br>

## Interface inicial

![0](https://user-images.githubusercontent.com/48495838/68510601-b9713780-0252-11ea-872a-550bf9472612.JPG)
<br><br><br><br>


## src/components/Search/index.js
```js
import React, { Component } from "react";
import { Platform } from "react-native";
import { GooglePlacesAutocomplete }
  from "react-native-google-places-autocomplete";

export default class Search extends Component {
  state = {
    searchFocused: false
  };

  render() {
    const { searchFocused } = this.state;
    const { onLocationSelected } = this.props;

    return (
      <GooglePlacesAutocomplete
        placeholder="Para onde?"
        placeholderTextColor="#333"
        onPress={onLocationSelected}
        query={{
          key: " ",
          language: "pt"
        }}
        textInputProps={{
          // Com foco na barra search
          onFocus: () => {
            this.setState({ searchFocused: true });
          },
          // Sem foco na barra search
          onBlur: () => {
            this.setState({ searchFocused: false });
          },
          autoCapitalize: "none",
          autoCorrect: false
        }}
        listViewDisplayed={searchFocused}
        // Trazer detalhes --> latit, longit, tempo percurso...
        fetchDetails
        enablePoweredByContainer={false}
        styles={{
          container: {
            position: "absolute",
            top: Platform.select({ ios: 60, android: 40 }),
            width: "100%"
          },
          textInputContainer: {
            flex: 1,
            backgroundColor: "transparent",
            height: 54,
            marginHorizontal: 20,
            borderTopWidth: 0,
            borderBottomWidth: 0
          },
          textInput: {
            height: 54,
            margin: 0,
            borderRadius: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            // sombra android
            elevation: 5,
            // sombra ios
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { x: 0, y: 0 },
            shadowRadius: 15,
            borderWidth: 1,
            borderColor: "#DDD",
            fontSize: 18
          },
          listView: {
            borderWidth: 1,
            borderColor: "#DDD",
            backgroundColor: "#FFF",
            marginHorizontal: 20,
            elevation: 5,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { x: 0, y: 0 },
            shadowRadius: 15,
            marginTop: 10
          },
          description: {
            fontSize: 16
          },
          row: {
            padding: 20,
            height: 58
          }
        }}
      />
    );
  }
};
```

<br><br>

## Interface após a idicação de endereço na barra de busca de destino

![1](https://user-images.githubusercontent.com/48495838/68510876-60ee6a00-0253-11ea-95b8-ee5a7e56e899.JPG)
<br><br><br><br>


## src/components/Directions/index.js
```js
import React from 'react';
import MapViewDirections from 'react-native-maps-directions';

//props
const Directions = ({ destination, origin, onReady }) => (
  <MapViewDirections
    destination={destination}
    origin={origin}
    onReady={onReady}
    apikey=" "
    strokeWidth={3}
    strokeColor="#222"
  />
);

export default Directions;
```


<br><br>


## src/components/Details/index.js
```js
import React, { Component } from 'react';

import
  {
    Container,
    TypeTitle,
    TypeDescription,
    TypeImage,
    RequestButton,
    RequestButtonText
  } from './styles';

import uberx from '../../assets/uberx.png';

export default class Details extends Component {
  render() {
    return (
      <Container>
        <TypeTitle>Popular</TypeTitle>
        <TypeDescription>Viagens baratas para o dia a dia</TypeDescription>

        <TypeImage source={uberx} />
        <TypeTitle>UperX</TypeTitle>
        <TypeDescription>R$14,00</TypeDescription>

        <RequestButton onPress={() => {}}>
          <RequestButtonText>SOLICITAR UPERX</RequestButtonText>
        </RequestButton>
      </Container>
    );
  }
};
```

<br><br>

## Interface após o redirecionamento entre origem e destino

![3](https://user-images.githubusercontent.com/48495838/68510650-d3127f00-0252-11ea-9edc-2c6a625e1495.JPG)
<br><br><br>
 
 
<br><br>
Renan Borba.
