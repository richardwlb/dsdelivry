import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import AsyncSelect from 'react-select/async';
import { OrderLocationData } from '../../pages/Orders/types';
import api from '../../services/apit';

const initialPosition = {
     lat: 51.505,
     lng: -0.09
}

type Place = {
    label?: string; // interrogação pq não é obrigatória
    value?: string;
    position: {
        lat: number,
        lng: number
    }
}

type Props = {
    onChangeLocation: (location: OrderLocationData) => void;
}

export default function OrderLocation( { onChangeLocation }: Props) {
    const [address, setAddress] = useState<Place>({
        position: initialPosition
    });

    const mapboxToken = process.env.REACT_APP_ACCESS_TOKEN_MAP_BOX;

    function fetchLocalMapBox(local: string){
        return api.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${local}.json?access_token=${mapboxToken}`);
    }

    const loadOptions = async (inputValue: string, callback: (places: Place[]) => void) => {
        const response = await fetchLocalMapBox(inputValue);
      
        const places = response.data.features.map((item: any) => {
          return ({
            label: item.place_name,
            value: item.place_name,
            position: {
              lat: item.center[1],
              lng: item.center[0]
            },
            place: item.place_name,
          });
        });
      
        callback(places);
      };
      
      const handleChangeSelect = (place: Place) => {
        setAddress(place);
        onChangeLocation({
          latitude: place.position.lat,
          longitude: place.position.lng,
          address: place.label!
        });
      };

    return (
        <div className="order-location-container">
            <div className="order-location-content">
                <h3 className="order-location-title" >
                    Selecione onde o pedido deve ser entregue
                </h3>
                <div className="filter-container">
                    <AsyncSelect
                        placeholder="Digite um endereço para entregar o pedido"
                        className="filter"
                        loadOptions={loadOptions}
                        onChange={value => handleChangeSelect(value as Place)}
                    />
                </div>
                <MapContainer 
                    center={address.position} 
                    zoom={15} 
                    key={address.position.lat}
                    scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={address.position}>
                        <Popup>
                            {address.label}
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}