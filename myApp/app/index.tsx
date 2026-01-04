import { useEffect, useState } from "react";
import { ScrollView, Image, View,Text} from "react-native";


interface PokemonListItem {
  name: string;
  url: string;
}

interface Pokemon {
  name: string;
  image: string;
  imageBack:string
}

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
        const res = await fetch(pokemon.url); // ✅ correct
        const details = await res.json();

        return {
  name: pokemon.name,
  image: details.sprites.front_default,
  imageBack: details.sprites.back_default,
};

      })
    );

    setPokemon(detailedPokemon); // ✅ only once
  } catch (e) {
    console.log(e);
  }
}

  return (
    <ScrollView>
  {pokemons.map((pokemon) => (
    <View key={pokemon.name}>
      <Text> {pokemon.name}</Text>

      <View style={{
        flexDirection:"row",}}
        >
          <Image
          source={{ uri:pokemon.image }}
          style= {{ width:200,height:200 }}
          />
        <Image 
        source={{uri:pokemon.imageBack}}
        style={{ width:200,height:200}}
        />
        </View>
      </View>
  ))}
</ScrollView>

  );
}
