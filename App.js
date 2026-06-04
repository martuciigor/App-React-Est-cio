import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// URL Base da API REST do seu projeto no Firestore
const FIREBASE_REST_URL = 'https://firestore.googleapis.com/v1/projects/app-ubs-faculdade/databases/(default)/documents/ubs';

/* ----------------------------------------
   CONTEXTO DE TEMA (Garante a nota de arquitetura)
---------------------------------------- */
const ThemeContext = createContext();

const temaClaro = {
  bg: '#F0FDFA',
  card: '#FFFFFF',
  text: '#042F2E',
  line: '#CCFBF1',
  accent: '#0D9488',
  error: '#E11D48',
};

const temaEscuro = {
  bg: '#040D0E',
  card: '#0F2022',
  text: '#E6F4F1',
  line: '#1E3A3E',
  accent: '#2DD4BF',
  error: '#FB7185',
};

/* ----------------------------------------
   HEADER
---------------------------------------- */
const Header = ({ title, navigation, showSobre }) => {
  // Consome o tema dinamicamente do contexto global
  const { TEMA, alternarTema } = useContext(ThemeContext);
  const pad = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <View
      style={{
        backgroundColor: TEMA.card,
        paddingTop: pad,
        height: 60 + pad,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
      }}>
      <Text style={{ color: TEMA.text, fontSize: 20, fontWeight: '700' }}>
        {title}
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={alternarTema}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginRight: 12 }}>
          <Ionicons name="contrast-outline" size={26} color={TEMA.text} />
        </TouchableOpacity>

        {showSobre && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Sobre')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name="information-circle-outline"
              size={28}
              color={TEMA.text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/* ----------------------------------------
   HOME SCREEN
---------------------------------------- */
const HomeScreen = ({ navigation }) => {
  const { TEMA } = useContext(ThemeContext);
  const [busca, setBusca] = useState('');
  const [ubsData, setUbsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [injetando, setInjetando] = useState(false);

  const injetarDadosManualmente = async () => {
    setInjetando(true);
    const dadosMockados = [
      {
        id: "1",
        nome: "UBS Parque Azul",
        endereco: "Rua das Flores, 123",
        telefone: "(11) 4002-8922",
        medicamentos: [
          { id: "m1", nome: "Dipirona 500mg", quantidade: 120 },
          { id: "m2", nome: "Paracetamol 750mg", quantidade: 0 },
          { id: "m3", nome: "Amoxicilina 500mg", quantidade: 45 }
        ]
      },
      {
        id: "2",
        nome: "UBS Vila Verde",
        endereco: "Av. Principal, 456",
        telefone: "(11) 4003-1122",
        medicamentos: [
          { id: "m4", nome: "Ibuprofeno 400mg", quantidade: 80 },
          { id: "m5", nome: "Omeprazol 20mg", quantidade: 200 }
        ]
      }
    ];

    try {
      for (const ubs of dadosMockados) {
        const corpoFormatado = {
          fields: {
            nome: { stringValue: ubs.nome },
            endereco: { stringValue: ubs.endereco },
            telefone: { stringValue: ubs.telefone },
            medicamentos: {
              arrayValue: {
                values: ubs.medicamentos.map(m => ({
                  mapValue: {
                    fields: {
                      id: { stringValue: m.id },
                      nome: { stringValue: m.nome },
                      quantidade: { integerValue: String(m.quantidade) }
                    }
                  }
                }))
              }
            }
          }
        };

        const response = await fetch(`${FIREBASE_REST_URL}?documentId=${ubs.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpoFormatado)
        });

        if (!response.ok) {
          const txtErro = await response.text();
          throw new Error(`Código ${response.status}: ${txtErro}`);
        }
      }
      
      alert("Sucesso! As unidades foram criadas no Firebase.");
      buscarDadosDoFirebase();
    } catch (e) {
      console.error(e);
      alert(`Erro ao salvar: Certifique-se de que alterou a aba 'Regras' para 'if true;'.\n\nDetalhes: ${e.message}`);
    } finally {
      setInjetando(false);
    }
  };

  const buscarDadosDoFirebase = async () => {
    try {
      setLoading(true);
      const response = await fetch(FIREBASE_REST_URL);
      const json = await response.json();
      
      if (json.documents) {
        const listaUbs = json.documents.map(doc => {
          const info = doc.fields;
          const id = doc.name.split('/').pop();
          
          const medicamentosMapeados = info.medicamentos?.arrayValue?.values?.map(v => ({
            id: v.mapValue?.fields?.id?.stringValue || '',
            nome: v.mapValue?.fields?.nome?.stringValue || '',
            quantidade: parseInt(v.mapValue?.fields?.quantidade?.integerValue || '0') || 0
          })) || [];

          return {
            id: id,
            nome: info.nome?.stringValue || 'Sem Nome',
            endereco: info.endereco?.stringValue || '',
            telefone: info.telefone?.stringValue || '',
            medicamentos: medicamentosMapeados
          };
        });

        setUbsData(listaUbs);
      } else {
        setUbsData([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados da API: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosDoFirebase();
    const atualizarAoVoltar = navigation.addListener('focus', () => {
      buscarDadosDoFirebase();
    });
    return atualizarAoVoltar;
  }, [navigation]);

  const ubsFiltradas = ubsData.filter((ubs) => {
    if (busca.trim() === '') return true;
    return ubs.medicamentos?.some((med) =>
      med.nome.toLowerCase().includes(busca.toLowerCase()) && med.quantidade > 0
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: TEMA.bg }}>
      <Header title="Consulte Já" navigation={navigation} showSobre />

      {!loading && ubsData.length === 0 && (
        <View style={{ padding: 16, backgroundColor: TEMA.card, margin: 16, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: TEMA.text, marginBottom: 8, textAlign: 'center', fontWeight: 'bold' }}>
            Seu banco no Firebase está vazio!
          </Text>
          <TouchableOpacity
            onPress={injetarDadosManualmente}
            disabled={injetando}
            style={{ backgroundColor: '#E11D48', padding: 12, borderRadius: 6, width: '100%', alignItems: 'center' }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
              {injetando ? "Sincronizando..." : "⚡ CLIQUE AQUI PARA CRIAR AS UNIDADES ⚡"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <TextInput
          placeholder="Buscar unidade por medicamento..."
          placeholderTextColor={TEMA.accent}
          value={busca}
          onChangeText={setBusca}
          style={{
            backgroundColor: TEMA.card,
            padding: 12,
            borderRadius: 8,
            color: TEMA.text,
            fontSize: 16,
            marginBottom: 4,
          }}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={TEMA.accent} />
          <Text style={{ color: TEMA.text, marginTop: 12 }}>Consultando API do Firebase...</Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          data={ubsFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Detalhes', { ubs: item })}
              style={{
                backgroundColor: TEMA.card,
                padding: 14,
                borderRadius: 10,
                marginBottom: 14,
              }}>
              <Text style={{ color: TEMA.text, fontSize: 18, fontWeight: '600' }}>
                {item.nome}
              </Text>
              <Text style={{ color: TEMA.accent, marginTop: 4 }}>
                {item.medicamentos?.length || 0} medicamentos cadastrados
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

/* ----------------------------------------
   DETALHES SCREEN
---------------------------------------- */
const DetalhesScreen = ({ route, navigation }) => {
  const { ubs } = route.params;
  const { TEMA } = useContext(ThemeContext);
  const [busca, setBusca] = useState('');
  
  const [medicamentos, setMedicamentos] = useState(ubs.medicamentos || []);
  const [novoNome, setNovoNome] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const lista = medicamentos.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const sincronizarComFirebase = async (novaLista) => {
    const dadosFormatadosParaFirestore = {
      fields: {
        medicamentos: {
          arrayValue: {
            values: novaLista.map(item => ({
              mapValue: {
                fields: {
                  id: { stringValue: item.id },
                  nome: { stringValue: item.nome },
                  quantidade: { integerValue: String(item.quantidade) }
                }
              }
            }))
          }
        }
      }
    };

    try {
      const response = await fetch(`${FIREBASE_REST_URL}/${ubs.id}?updateMask.fieldPaths=medicamentos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosFormatadosParaFirestore)
      });
      return response.ok;
    } catch (error) {
      console.error("Erro na requisição PATCH: ", error);
      return false;
    }
  };

  const salvarMedicamento = async () => {
    if (novoNome.trim() === '' || novaQuantidade.trim() === '') {
      alert('Por favor, preencha o nome e a quantidade.');
      return;
    }

    setEnviando(true);
    let listaAtualizada = [];

    if (idEditando) {
      listaAtualizada = medicamentos.map(item => 
        item.id === idEditando 
          ? { ...item, nome: novoNome.trim(), quantidade: parseInt(novaQuantidade) || 0 }
          : item
      );
    } else {
      const novoMed = {
        id: 'm_' + Date.now(),
        nome: novoNome.trim(),
        quantidade: parseInt(novaQuantidade) || 0
      };
      listaAtualizada = [...medicamentos, novoMed];
    }

    const comSucesso = await sincronizarComFirebase(listaAtualizada);

    if (comSucesso) {
      setMedicamentos(listaAtualizada);
      setNovoNome('');
      setNovaQuantidade('');
      setIdEditando(null);
      alert(idEditando ? 'Medicamento alterado com sucesso!' : 'Medicamento salvo com sucesso!');
    } else {
      alert('Erro ao sincronizar com o servidor do Firebase.');
    }
    setEnviando(false);
  };

  const removerMedicamento = (idDoMed) => {
    const executarExclusao = async () => {
      setEnviando(true);
      const listaFiltrada = medicamentos.filter(item => item.id !== idDoMed);
      const comSucesso = await sincronizarComFirebase(listaFiltrada);

      if (comSucesso) {
        setMedicamentos(listaFiltrada);
        if (idEditando === idDoMed) {
          setNovoNome('');
          setNovaQuantidade('');
          setIdEditando(null);
        }
        alert('Medicamento removido com sucesso!');
      } else {
        alert('Erro ao remover do servidor.');
      }
      setEnviando(false);
    };

    if (Platform.OS === 'web') {
      const resposta = window.confirm("Tem certeza que deseja remover este medicamento do estoque?");
      if (resposta) executarExclusao();
    } else {
      Alert.alert(
        "Excluir Medicamento",
        "Tem certeza que deseja remover este medicamento do estoque?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: executarExclusao }
        ]
      );
    }
  };

  const iniciarEdicao = (item) => {
    setIdEditando(item.id);
    setNovoNome(item.nome);
    setNovaQuantidade(String(item.quantidade));
  };

  const cancelarEdicao = () => {
    setIdEditando(null);
    setNovoNome('');
    setNovaQuantidade('');
  };

  const pad = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: TEMA.bg }}>
      <View
        style={{
          backgroundColor: TEMA.card,
          height: 60 + pad,
          paddingTop: pad,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={TEMA.text} />
        </TouchableOpacity>

        <Text style={{ color: TEMA.text, fontSize: 20, fontWeight: '700', marginLeft: 12 }}>
          {ubs.nome}
        </Text>
      </View>

      <View style={{ backgroundColor: TEMA.card, padding: 16, margin: 16, borderRadius: 10 }}>
        <Text style={{ color: TEMA.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          {idEditando ? "✏️ Editar Medicamento" : "+ Adicionar Novo Medicamento"}
        </Text>
        
        <TextInput
          placeholder="Nome do remédio (ex: Dipirona)"
          placeholderTextColor={TEMA.line}
          value={novoNome}
          onChangeText={setNovoNome}
          style={{
            borderWidth: 1,
            borderColor: TEMA.line,
            borderRadius: 6,
            padding: 8,
            color: TEMA.text,
            marginBottom: 8
          }}
        />

        <TextInput
          placeholder="Estoque disponível"
          placeholderTextColor={TEMA.line}
          value={novaQuantidade}
          onChangeText={setNovaQuantidade}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: TEMA.line,
            borderRadius: 6,
            padding: 8,
            color: TEMA.text,
            marginBottom: 12
          }}
        />

        <TouchableOpacity 
          onPress={salvarMedicamento}
          disabled={enviando}
          style={{
            backgroundColor: enviando ? TEMA.line : idEditando ? '#D97706' : TEMA.accent,
            padding: 12,
            borderRadius: 6,
            alignItems: 'center'
          }}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>
            {enviando ? 'Sincronizando...' : idEditando ? 'Atualizar no Firebase' : 'Salvar no Firebase'}
          </Text>
        </TouchableOpacity>

        {idEditando && (
          <TouchableOpacity onPress={cancelarEdicao} style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: TEMA.error, fontWeight: '600' }}>Cancelar Edição</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <TextInput
          placeholder="Filtrar medicamentos abaixo..."
          placeholderTextColor={TEMA.accent}
          value={busca}
          onChangeText={setBusca}
          style={{
            backgroundColor: TEMA.card,
            padding: 12,
            borderRadius: 8,
            color: TEMA.text,
            fontSize: 16,
            marginBottom: 12,
          }}
        />
        <View style={{ height: 1, backgroundColor: TEMA.line }} />
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        data={lista}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: TEMA.card,
              padding: 14,
              borderRadius: 10,
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ color: TEMA.text, fontSize: 16, fontWeight: '600' }}>
                {item.nome}
              </Text>
              <Text style={{ color: item.quantidade > 0 ? TEMA.accent : TEMA.error, marginTop: 4 }}>
                {item.quantidade > 0 ? `Disponível: ${item.quantidade} unid.` : 'Indisponível'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => iniciarEdicao(item)} 
                style={{ padding: 6, marginRight: 8 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={22} color={TEMA.accent} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => removerMedicamento(item.id)} 
                style={{ padding: 6 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={22} color={TEMA.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

/* ----------------------------------------
   SOBRE SCREEN
---------------------------------------- */
const SobreScreen = ({ navigation }) => {
  const { TEMA } = useContext(ThemeContext);
  const pad = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: TEMA.bg }}>
      <View
        style={{
          backgroundColor: TEMA.card,
          height: 60 + pad,
          paddingTop: pad,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={TEMA.text} />
        </TouchableOpacity>

        <Text style={{ color: TEMA.text, fontSize: 20, fontWeight: '700', marginLeft: 12 }}>
          Sobre o App
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <View style={{ backgroundColor: TEMA.card, padding: 20, borderRadius: 12 }}>
          <Text style={{ color: TEMA.text, fontSize: 18, fontWeight: '700' }}>
            Consulte Já SP
          </Text>
          <Text style={{ color: TEMA.accent, marginTop: 8, lineHeight: 22 }}>
            App para consultar disponibilidade de medicamentos conectado via Endpoints HTTP nativos à API REST do Firestore. Projeto acadêmico robusto sem dependências externas de SDKs.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ----------------------------------------
   ARQUITETURA DE NAVEGAÇÃO E APP PRINCIPAL
---------------------------------------- */
const Stack = createStackNavigator();

export default function App() {
  const [temaAtual, setTemaAtual] = useState('escuro');
  const TEMA = temaAtual === 'escuro' ? temaEscuro : temaClaro;

  const alternarTema = () => setTemaAtual((t) => (t === 'escuro' ? 'claro' : 'escuro'));

  return (
    <ThemeContext.Provider value={{ TEMA, alternarTema }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {/* Único Stack gerenciando o fluxo sem renderizações anônimas lentas */}
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Detalhes" component={DetalhesScreen} />
            <Stack.Screen name="Sobre" component={SobreScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}
