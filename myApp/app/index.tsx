import { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  Image,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
}

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
  abilities: PokemonAbility[];
  description: string;
}

const PokemonTypeColors: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};


function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const descriptionAnim = useRef(new Animated.Value(0)).current;
  const [showDescription, setShowDescription] = useState(false);

  const primaryType = pokemon.types[0]?.type.name;
  const bgColor = PokemonTypeColors[primaryType] ?? "#999";

  const toggleDescription = () => {
    Animated.timing(descriptionAnim, {
      toValue: showDescription ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setShowDescription(!showDescription);
  };

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: 25,
        padding: 16,
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
          color: "white",
          textTransform: "capitalize",
          marginBottom: 6,
        }}
      >
        {pokemon.name}
      </Text>

      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {pokemon.types.map((t) => (
          <Text
            key={t.slot}
            style={{
              color: "white",
              textTransform: "capitalize",
              fontSize: 18,
              marginHorizontal: 6,
            }}
          >
            {t.type.name}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Image source={{ uri: pokemon.image }} style={{ width: 150, height: 150 }} />
        <Image source={{ uri: pokemon.imageBack }} style={{ width: 150, height: 150 }} />
      </View>

      <TouchableOpacity
        onPress={toggleDescription}
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 20,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {showDescription ? "Hide Info" : "Show Info"}
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={{
          opacity: descriptionAnim,
          transform: [
            {
              translateY: descriptionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          {pokemon.description}
        </Text>
      </Animated.View>
    </View>
  );
}


export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=150"
      );
      const data = await response.json();

      const detailedPokemon: Pokemon[] = await Promise.all(
        data.results.map(async (pokemon: PokemonListItem) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();

          const speciesRes = await fetch(details.species.url);
          const species = await speciesRes.json();

          const flavorTextEntry = species.flavor_text_entries?.find(
            (entry: { language: { name: string } }) =>
              entry.language.name === "en"
          );

          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,
            abilities: details.abilities,
            description: flavorTextEntry
              ? flavorTextEntry.flavor_text.replace(/\n|\f/g, " ")
              : "No description available.",
          };
        })
      );

      setPokemons(detailedPokemon);
    } catch (error) {
      console.error("Failed to fetch Pokémon:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {pokemons.map((pokemon) => (
        <PokemonCard key={pokemon.name} pokemon={pokemon} />
      ))}
    </ScrollView>
  );
}
