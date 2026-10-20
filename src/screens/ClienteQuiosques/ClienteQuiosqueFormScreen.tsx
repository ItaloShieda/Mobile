import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/Header/BackButton';
import { BottomTabBar, useBottomTabBarHeight } from '../../components/layout/BottomTabBar';
import { RemoteImage } from '../../components/media/RemoteImage';
import { getImageUrl } from '../../config/api';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { formatarPreco } from '../../services/productService';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { PRIMARY, styles } from './styles';
import { useClienteQuiosqueForm } from './useClienteQuiosqueForm';

const FOOTER_SPACE = 170;

export function ClienteQuiosqueFormScreen() {
  const goBack = useAppGoBack('ClienteQuiosques');
  const topPadding = useHeaderTopPadding(8);
  const tabBarHeight = useBottomTabBarHeight();
  const {
    isEditing,
    quiosqueNaoEncontrado,
    loading,
    nome,
    setNome,
    linhas,
    erros,
    temErroLinha,
    totais,
    saving,
    saveError,
    setQuantidade,
    alterarQuantidade,
    setPreco,
    salvar,
    excluir,
  } = useClienteQuiosqueForm();

  const salvarDesativado = saving || temErroLinha || loading;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: FOOTER_SPACE }}
      >
        <View style={[styles.header, { paddingTop: topPadding }]}>
          <View style={styles.headerTop}>
            <BackButton onPress={goBack} iconColor={PRIMARY} />
            <View style={styles.brandRow}>
              <Text style={styles.brandQuick}>Quick</Text>
              <Text style={styles.brandStock}>Stock</Text>
            </View>
            <View style={styles.headerSide} />
          </View>
          <Text style={styles.title}>{isEditing ? 'Editar quiosque' : 'Novo quiosque'}</Text>
          <Text style={styles.subtitle}>
            Escolha quanto de cada produto vai para este quiosque e o preço de venda.
          </Text>
        </View>

        <View style={styles.sheet}>
          {loading && linhas.length === 0 ? (
            <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
          ) : quiosqueNaoEncontrado ? (
            <View style={[styles.card, styles.empty]}>
              <Ionicons name="alert-circle-outline" size={40} color={PRIMARY} />
              <Text style={styles.emptyTitle}>Quiosque não encontrado</Text>
              <Text style={styles.emptyText}>Ele pode ter sido excluído.</Text>
              <TouchableOpacity onPress={goBack} activeOpacity={0.8}>
                <Text style={styles.retryText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.label}>Nome do quiosque</Text>
                <TextInput
                  style={[styles.input, erros.nome && styles.inputError]}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Ex.: Barraca Festa Junina"
                  placeholderTextColor="#9AA3B2"
                />
                {erros.nome ? <Text style={styles.fieldError}>{erros.nome}</Text> : null}
              </View>

              <Text style={styles.sectionTitle}>Produtos</Text>
              {linhas.length === 0 ? (
                <View style={[styles.card, styles.empty]}>
                  <Ionicons name="cube-outline" size={40} color={PRIMARY} />
                  <Text style={styles.emptyText}>
                    Você ainda não tem produtos recebidos para colocar no quiosque.
                  </Text>
                </View>
              ) : (
                linhas.map((linha) => {
                  const erroLinha = erros.linhas?.[linha.produtoId];
                  return (
                    <View
                      key={linha.produtoId}
                      style={[styles.card, styles.produtoCard, erroLinha && styles.produtoCardError]}
                    >
                      <View style={styles.produtoTop}>
                        <RemoteImage
                          uri={getImageUrl(linha.produto.imagemUrl)}
                          style={styles.produtoThumb}
                          fallbackLabel={linha.produto.nome}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.produtoNome} numberOfLines={2}>{linha.produto.nome}</Text>
                          <Text style={[styles.disponivel, linha.disponivel === 0 && styles.disponivelZero]}>
                            {linha.disponivel} de {linha.produto.estoque ?? 0} {linha.produto.unidade} disponíveis
                          </Text>
                          {linha.precoPago !== undefined ? (
                            <Text style={styles.precoPago}>Você pagou {formatarPreco(linha.precoPago)}</Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.produtoInputs}>
                        <View style={styles.produtoInputCol}>
                          <Text style={styles.label}>Quantidade</Text>
                          <View style={[styles.stepper, erroLinha?.quantidade && styles.inputError]}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => alterarQuantidade(linha.produtoId, -1, linha.disponivel)}
                              accessibilityLabel="Diminuir quantidade"
                            >
                              <Ionicons name="remove" size={18} color={PRIMARY} />
                            </TouchableOpacity>
                            <TextInput
                              style={styles.stepperInput}
                              value={linha.quantidade}
                              onChangeText={(v) => setQuantidade(linha.produtoId, v)}
                              keyboardType="number-pad"
                              placeholder="0"
                              placeholderTextColor="#9AA3B2"
                            />
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => alterarQuantidade(linha.produtoId, 1, linha.disponivel)}
                              accessibilityLabel="Aumentar quantidade"
                            >
                              <Ionicons name="add" size={18} color={PRIMARY} />
                            </TouchableOpacity>
                          </View>
                          {erroLinha?.quantidade ? (
                            <Text style={styles.fieldError}>{erroLinha.quantidade}</Text>
                          ) : null}
                        </View>

                        <View style={styles.produtoInputCol}>
                          <Text style={styles.label}>Preço de venda</Text>
                          <View style={[styles.precoInputRow, erroLinha?.precoVenda && styles.inputError]}>
                            <Text style={styles.precoPrefix}>R$</Text>
                            <TextInput
                              style={styles.precoInput}
                              value={linha.precoVenda}
                              onChangeText={(v) => setPreco(linha.produtoId, v)}
                              keyboardType="decimal-pad"
                              placeholder="0,00"
                              placeholderTextColor="#9AA3B2"
                            />
                          </View>
                          {erroLinha?.precoVenda ? (
                            <Text style={styles.fieldError}>{erroLinha.precoVenda}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}

              {isEditing ? (
                <TouchableOpacity style={styles.deleteButton} onPress={excluir} activeOpacity={0.8}>
                  <Text style={styles.deleteText}>Excluir quiosque</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      {!quiosqueNaoEncontrado ? (
        <View style={[styles.footer, { bottom: tabBarHeight }]}>
          <View style={styles.footerTotals}>
            <View>
              <Text style={styles.footerLabel}>Total no quiosque</Text>
              <Text style={styles.footerValue}>{totais.unidades} un.</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>Valor estimado</Text>
              <Text style={styles.footerValue}>{formatarPreco(totais.valor)}</Text>
            </View>
          </View>
          {saveError || erros.geral ? (
            <Text style={styles.saveError}>{saveError || erros.geral}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, salvarDesativado && styles.buttonDisabled]}
            onPress={salvar}
            disabled={salvarDesativado}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.primaryButtonText}>Salvar quiosque</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <BottomTabBar activeRoute="ClienteQuiosqueForm" />
    </KeyboardAvoidingView>
  );
}
