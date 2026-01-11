import { useEffect, useState } from "react";
import { ScrollView, Image, View, Text } from "react-native";

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

export default function Index() {
  const [pokemons, setPokemon] = useState<Pokemon[]>([]);

  useEffect(() => {
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=150"
      );
      const data = await response.json();

      const detailedPokemon: Pokemon[] = await Promise.all(
        data.results.map(async (pokemon: PokemonListItem) => {
         
          const res = await fetch(pokemon.url);
          const details = await res.json();

        
          const speciesRes = await fetch(details.species.url);
          const species = await speciesRes.json();

          const flavorText = species.flavor_text_entries?.find(
            (entry: any) => entry.language.name === "en"
          );

          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,
            abilities: details.abilities,
            description: flavorText
              ? flavorText.flavor_text.replace(/\n|\f/g, " ")
              : "No description available.",
          };
        })
      );

      setPokemon(detailedPokemon);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 16,
      }}
      keyboardShouldPersistTaps="always" 
    >
      {pokemons.map((pokemon) => {
        const primaryType = pokemon.types[0]?.type.name;
        const bgColor = PokemonTypeColors[primaryType] ?? "#999";

        return (
          <View
            key={pokemon.name}
            style={{
              backgroundColor: bgColor,
              borderRadius: 25,
              padding: 16,
              alignItems: "center",
            }}
          >
           
            <Text
              style={{
                fontSize:30,
                fontWeight: "bold",
                color: "white",
                textTransform: "capitalize",
                textAlign: "center",
              }}
            >
              {pokemon.name}
            </Text>

         
            <View style={{ flexDirection: "row", gap: 8, marginVertical: 6 }}>
              {pokemon.types.map((t) => (
                <Text
                  key={t.slot}
                  style={{ color: "white", textTransform: "capitalize",fontSize:20 }}
                >
                  {t.type.name}
                </Text>
              ))}
            </View>

          
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <Image
                source={{ uri: pokemon.image }}
                style={{ width: 200, height: 200 }}
              />
              <Image
                source={{ uri: pokemon.imageBack }}
                style={{ width: 200, height: 200 }}
              />
            </View>

           
            <Text
              style={{
                color: "white",
                fontSize: 20,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {pokemon.description}
            </Text>

         
            <Text
              style={{
                fontSize:20,
                color: "white",
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              Abilities
            </Text>

            {pokemon.abilities.map((a, index) => (
              <Text
                key={index}
                style={{ color: "white", textTransform: "capitalize", fontSize:20}}
              >
                • {a.ability.name}
              </Text>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
