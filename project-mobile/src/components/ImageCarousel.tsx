// src/components/ImageCarousel.tsx
import React from 'react';
import { ScrollView, Image, Dimensions } from 'react-native';

interface Props {
  images: string[];
}

export default function ImageCarousel({ images }: Props) {
  const width = Dimensions.get('window').width;
  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
      {images.map((uri, idx) => (
        <Image
          key={idx}
          source={{ uri }}
          style={{ width, height: 300 }}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}
