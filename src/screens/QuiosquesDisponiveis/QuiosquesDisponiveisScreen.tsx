import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../../components/Header/BackButton';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { RemoteImage } from '../../components/media/RemoteImage';
import { getImageUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { listarQuiosquesDisponiveis, QuiosqueDisponivel } from '../../services/marketplaceService';
import { formatarPreco } from '../../services/productService';
import { CLIENTE_COLORS, COMPANY_COLORS } from '../../theme/theme';
import { formatarDataCurta } from '../../utils/dateFormat';
import { useBottomInset, useHeaderTopPadding } from '../../utils/safeArea';

const ATRASO_BUSCA_MS = 300;
const TEXTO = '#1F2937';
const SUAVE = '#5B6573';
const BORDA = '#E3E8EF';

/** Quiosques montados por outras contas (clientes e distribuidoras) no Stock4event. */
export function QuiosquesDisponiveisScreen() {
  const navigation = useNavigation<any>();
  const goBack = useAppGoBack('Home');
  const { perfilUso } = useAuth();
  const topPadding = useHeaderTopPadding(8);
  const bottomInset = useBottomInset();
  const ehCliente = perfilUso === 'Cliente';
  const cor = ehCliente ? CLIENTE_COLORS.primary : COMPANY_COLORS.primary;
  const corTexto = ehCliente ? '#011C46' : '#FFFFFF';

  const [busca, setBusca] = useState('');
  const [quiosques, setQuiosques] = useState<QuiosqueDisponivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const seq = useRef(0);

  const carregar = useCallback(async (termo: string, pull = false) => {
    const atual = ++seq.current;
    pull ? setAtualizando(true) : setCarregando(true);
    setErro('');
    try {
      const lista = await listarQuiosquesDisponiveis(termo);
      if (atual === seq.current) setQuiosques(lista);
    } catch (e) {
      if (atual === seq.current) setErro(e instanceof Error ? e.message : 'Não foi possível carregar os quiosques.');
    } finally {
      if (atual === seq.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void carregar(busca), busca ? ATRASO_BUSCA_MS : 0);
    return () => clearTimeout(t);
  }, [busca, carregar]);

  const abrirDistribuidora = (q: QuiosqueDisponivel) => {
    navigation.navigate('StoreVitrine', {
      fornecedorId: q.empresaId,
      fornecedorNome: q.empresaNome,
      descricao: q.empresaDescricao ?? undefined,
      logoUrl: q.empresaLogoUrl ?? undefined,
      capaUrl: q.empresaCapaUrl ?? undefined,
      tipo: q.empresaTipo ?? undefined,
    });
  };

  const periodo = (q: QuiosqueDisponivel) =>
    q.dataInicio && q.dataFim ? `${formatarDataCurta(q.dataInicio)} a ${formatarDataCurta(q.dataFim)}` : '';

  const renderQuiosque = ({ item: q }: { item: QuiosqueDisponivel }) => (
    <View style={styles.card}>
      <View style={styles.cardTopo}>
        <RemoteImage uri={getImageUrl(q.empresaLogoUrl)} style={styles.logo} fallbackLabel={q.empresaNome} resizeMode="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitulo} numberOfLines={1}>{q.nome}</Text>
          <Text style={styles.cardEmpresa} numberOfLines={1}>{q.empresaNome}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {q.eventoNome}{periodo(q) ? ` · ${periodo(q)}` : ''}
          </Text>
        </View>
        <View style={[styles.selo, { backgroundColor: q.produtosDisponiveis > 0 ? '#E8F5EC' : '#FDECEC' }]}>
          <Text style={[styles.seloTexto, { color: q.produtosDisponiveis > 0 ? '#1F7A3A' : '#B42318' }]}>
            {q.produtosDisponiveis > 0 ? `${q.produtosDisponiveis} à venda` : 'Sem estoque'}
          </Text>
        </View>
      </View>

      {q.produtos.length === 0 ? (
        <Text style={styles.cardMeta}>Este quiosque ainda não tem produtos.</Text>
      ) : (
        q.produtos.slice(0, 6).map((p) => (
          <View key={p.produtoId} style={styles.produto}>
            <Text style={[styles.produtoNome, !p.disponivel && styles.esgotado]} numberOfLines={1}>{p.nome}</Text>
            <Text style={[styles.produtoPreco, !p.disponivel && styles.esgotado]}>
              {p.disponivel ? formatarPreco(p.precoVenda) : 'Esgotado'}
            </Text>
          </View>
        ))
      )}
      {q.produtos.length > 6 && <Text style={styles.cardMeta}>+ {q.produtos.length - 6} produtos</Text>}

      {q.distribuidora && (
        <TouchableOpacity style={[styles.botao, { backgroundColor: cor }]} onPress={() => abrirDistribuidora(q)} activeOpacity={0.85}>
          <Ionicons name="storefront-outline" size={16} color={corTexto} />
          <Text style={[styles.botaoTexto, { color: corTexto }]}>Ver distribuidora</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { backgroundColor: cor, paddingTop: topPadding }]}>
        <View style={styles.headerRow}>
          <BackButton onPress={goBack} iconColor={ehCliente ? '#011C46' : undefined} />
          <BrandLogo variant={ehCliente ? 'azul' : 'branco'} height={28} />
          <View style={{ width: 32 }} />
        </View>
        <Text style={[styles.titulo, { color: corTexto }]}>Quiosques disponíveis</Text>
        <Text style={[styles.subtitulo, { color: corTexto }]}>Quiosques montados por outras empresas no Stock4event.</Text>
        <View style={styles.busca}>
          <Ionicons name="search" size={18} color={SUAVE} />
          <TextInput
            style={styles.buscaInput}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar quiosque, empresa ou produto"
            placeholderTextColor={SUAVE}
            autoCorrect={false}
            accessibilityLabel="Buscar quiosques"
          />
          {!!busca && (
            <TouchableOpacity onPress={() => setBusca('')} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={18} color={SUAVE} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {carregando && quiosques.length === 0 ? (
        <ActivityIndicator color={cor} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={quiosques}
          keyExtractor={(q) => String(q.id)}
          renderItem={renderQuiosque}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 24, gap: 12 }}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void carregar(busca, true)} />}
          ListHeaderComponent={erro ? (
            <View style={styles.erro}>
              <Text style={styles.erroTexto}>{erro}</Text>
              <TouchableOpacity onPress={() => void carregar(busca)}><Text style={styles.link}>Tentar novamente</Text></TouchableOpacity>
            </View>
          ) : null}
          ListEmptyComponent={erro ? null : (
            <View style={styles.vazio}>
              <Ionicons name="storefront-outline" size={34} color={SUAVE} />
              <Text style={styles.vazioTitulo}>{busca ? 'Nenhum quiosque encontrado' : 'Nenhum quiosque disponível'}</Text>
              <Text style={styles.vazioTexto}>
                {busca ? 'Tente outro nome de quiosque, empresa ou produto.' : 'Quando outras contas criarem quiosques, eles aparecem aqui.'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8FB' },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { fontSize: 22, fontWeight: '800', marginTop: 10 },
  subtitulo: { fontSize: 13, marginTop: 2, opacity: 0.85 },
  busca: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 999, paddingHorizontal: 12, marginTop: 12 },
  buscaInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15, color: TEXTO },
  card: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: BORDA, padding: 14, gap: 6 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  logo: { width: 44, height: 44, borderRadius: 22 },
  cardTitulo: { fontSize: 16, fontWeight: '800', color: TEXTO },
  cardEmpresa: { fontSize: 13, fontWeight: '700', color: SUAVE },
  cardMeta: { fontSize: 12, color: SUAVE },
  selo: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  seloTexto: { fontSize: 11, fontWeight: '800' },
  produto: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 3, borderTopWidth: 1, borderTopColor: '#F1F4F8' },
  produtoNome: { flex: 1, fontSize: 13, color: TEXTO },
  produtoPreco: { fontSize: 13, fontWeight: '700', color: TEXTO },
  esgotado: { color: '#9AA3AF' },
  botao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 999, paddingVertical: 10, marginTop: 6 },
  botaoTexto: { fontWeight: '800' },
  erro: { backgroundColor: '#FDECEC', borderRadius: 12, padding: 12, gap: 6 },
  erroTexto: { color: '#B42318', fontWeight: '600' },
  link: { color: '#2F95DC', fontWeight: '700' },
  vazio: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  vazioTitulo: { fontSize: 16, fontWeight: '800', color: TEXTO },
  vazioTexto: { color: SUAVE, textAlign: 'center' },
});
