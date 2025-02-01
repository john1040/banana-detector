import React, { useState } from "react";
import { View, Button, Image, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";

const GOOGLE_CLOUD_VISION_API_KEY = "AIzaSyDEysMfXlZVgKqqIeYzxG2dcpU9CM83XiU";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    try {
      const base64 = await fetch(uri)
        .then((res) => res.blob())
        .then((blob) => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }));

      const body = {
        requests: [
          {
            image: { content: base64.split(",")[1] },
            features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
          },
        ],
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      const labels = data.responses[0]?.labelAnnotations.map((label: any) => label.description);
      setResult(labels?.includes("Banana") ? "🍌 It's a Banana!" : "❌ Not a Banana");
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult("Error detecting image.");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Pick an image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 10 }} />}
      {result && <Text style={{ marginTop: 10, fontSize: 18 }}>{result}</Text>}
    </View>
  );
}
