// src/components/VariantSelector.tsx
import React from 'react';
import { View, Button } from 'react-native';

export interface Variant {
  id: string;
  title: string;
}

interface Props {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
      {variants.map(v => (
        <Button
          key={v.id}
          title={v.title}
          onPress={() => onSelect(v.id)}
          color={v.id === selectedId ? 'blue' : undefined}
        />
      ))}
    </View>
  );
}
