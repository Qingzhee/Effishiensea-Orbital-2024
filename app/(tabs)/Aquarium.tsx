import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FishesModel from './Models/FishesModel';
import AquariumView from './AquariumView';


export default function Aquarium({ navigation }) {
    const [fishData, setFishData] = useState([]);
    const { width, height } = Dimensions.get('screen');
    const insets = useSafeAreaInsets();

    const usableHeight = height - insets.top - insets.bottom;
    const usableWidth = width - insets.left - insets.right;

    //Get the user's fish data from Firebase and stores fish types and tiers in fishData array
    const getFishes = () => {
        FishesModel.getFishes()
            .then((fishes) => {
                setFishData(fishes);
        }).catch((error) => {
            console.log(error);
        });
    }

    //Initializes the starting position of each fish
    const fishAnimValues = fishData.map((fish) => {
        let xValue = Math.random() * usableWidth * 0.8;
        let yValue = (fish.type == 'lobster' || fish.type == 'spidercrab')
                    ? 800
                    : Math.random() * usableHeight * 0.7 + 100;
        return new Animated.ValueXY({
            x: xValue,
            y: yValue,
        });
    }, [fishData]);

    //Fetch the user's fish data by calling getFishes() each time the aquarium page is re-opened
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getFishes();
        });
        return unsubscribe;
    }, [navigation]
    );

    //Animation loop for fishes
    const animateAndLoop = (position, fishAnimValues, index, type) => {    
        const animation = animate(position, fishAnimValues, index);
        animation.start(({ finished }) => {
            if (finished) {
                position = { 
                    x: Math.random() * usableWidth * 0.5, 
                    y: (type =='lobster' || type == 'spidercrab') 
                        ? Math.random() * 50 + 770 
                        : Math.random() * usableHeight * 0.7 + 150 };
                animateAndLoop(position, fishAnimValues, index, type);
            }
        });
    };

    //Animates each fish from start to end point of one swim movement
    const animate = (toPosition, fishAnimValues, index) => {
        return Animated.sequence([
            Animated.timing(fishAnimValues[index], {
                toValue: toPosition,
                duration: Math.random() * 2000 + 3000,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            Animated.delay(300),
        ]);
    };

    //Starts the animations for all the fishes upon screen open
    useEffect(() => {
        const animations = fishData.map((data, index) => {
            let xValue = Math.random() * usableWidth * 0.5;
            let yValue = (data.type == 'lobster' || data.type == 'spidercrab') 
                        ? 800 
                        : Math.random() * usableHeight * 0.7 + 150;
            let position = { x: xValue, y: yValue };
            return animateAndLoop(position, fishAnimValues, index, data.type);
        });
    });

    return (
        <AquariumView 
            fishData={fishData} 
            fishAnimValues={fishAnimValues}
        />
    );
}