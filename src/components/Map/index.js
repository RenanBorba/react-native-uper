import React, { Component, Fragment } from "react";
import { View, Image } from "react-native";
//import { MapView } from 'expo';
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";

import { getPixelSize } from "../../utils";
import Search from "../Search";
import Directions from "../Directions";
import Details from "../Details";
import markerImage from "../../assets/marker.png";
import backImage from "../../assets/back.png";

import 
{
  Back,
  LocationBox,
  LocationText,
  LocationTimeBox,
  LocationTimeText,
  LocationTimeTextSmall
} from "./styles";

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
                origin={region}
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
