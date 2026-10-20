import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenLayout } from '../../components/layout/TabScreenLayout';
import { PagePrimaryButton } from '../../components/Button/PagePrimaryButton';
import { BottomTabBar, useBottomTabBarHeight } from '../../components/layout/BottomTabBar';
import { BackButton } from '../../components/Header/BackButton';
import { IconActionButton } from '../../components/Button/IconActionButton';
import { CartoesCadastradosModal } from '../../components/Card/CartoesCadastradosModal';
import { PixCadastradosModal } from '../../components/Card/PixCadastradosModal';
import { useAuth } from '../../context/AuthContext';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { useHeaderTopPadding } from '../../utils/safeArea';
import {
  iconeTipoPagamento,
  labelTipoPagamento,
} from '../../services/formaPagamentoService';
import { clienteStyles, styles } from './styles';
import { TIPOS_DISPONIVEIS, hintForma, isFormaComDetalhes, isTipoCartao } from './formasHelpers';
import { useFormasPagamento } from './useFormasPagamento';
import { CLIENTE_COLORS } from '../../theme/theme';

const PRIMARY = CLIENTE_COLORS.primary;

export function FormasPagamentoScreen() {
  const { perfilUso } = useAuth();
  const isCliente = perfilUso === 'Cliente';
  const goBack = useAppGoBack(isCliente ? 'Perfil' : 'Home');
  const topPadding = useHeaderTopPadding(8);
  const tabBarHeight = useBottomTabBarHeight();
  const {
    empresaId,
    cnpjEmpresa,
    formas,
    loading,
    error,
    modalVisible,
    setModalVisible,
    tipoSelecionado,
    apelido,
    setApelido,
    salvando,
    modalErro,
    cartoesModalVisible,
    setCartoesModalVisible,
    cartoesModalTipo,
    pixModalVisible,
    setPixModalVisible,
    carregar,
    abrirModal,
    abrirPix,
    abrirCartoes,
    handlePressForma,
    handleSelecionarTipo,
    handleSalvar,
    confirmarRemocao,
  } = useFormasPagamento();

  const extras = (
    <>
      {empresaId ? (
        <>
          <CartoesCadastradosModal
            visible={cartoesModalVisible}
            empresaId={empresaId}
            tipo={cartoesModalTipo}
            onClose={() => setCartoesModalVisible(false)}
          />
          <PixCadastradosModal
            visible={pixModalVisible}
            empresaId={empresaId}
            cnpjEmpresa={cnpjEmpresa}
            onClose={() => setPixModalVisible(false)}
          />
        </>
      ) : null}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova forma de pagamento</Text>

            <Text style={styles.modalLabel}>Tipo</Text>
            <View style={styles.tipoRow}>
              {TIPOS_DISPONIVEIS.map((tipo) => {
                const selected = tipoSelecionado === tipo.id;
                return (
                  <TouchableOpacity
                    key={tipo.id}
                    style={[styles.tipoChip, selected && styles.tipoChipSelected]}
                    onPress={() => handleSelecionarTipo(tipo.id)}
                  >
                    <Text style={[styles.tipoChipText, selected && styles.tipoChipTextSelected]}>
                      {tipo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {tipoSelecionado === 'pix' ? (
              <TouchableOpacity style={styles.verCartoesBtn} onPress={abrirPix}>
                <Ionicons name="phone-portrait-outline" size={18} color="#F8B125" />
                <Text style={styles.verCartoesText}>Ver chaves PIX cadastradas</Text>
                <Ionicons name="chevron-forward" size={16} color="#F8B125" />
              </TouchableOpacity>
            ) : null}

            {isTipoCartao(tipoSelecionado) ? (
              <TouchableOpacity
                style={styles.verCartoesBtn}
                onPress={() => abrirCartoes(tipoSelecionado)}
              >
                <Ionicons name="card-outline" size={18} color="#F8B125" />
                <Text style={styles.verCartoesText}>Ver cartões cadastrados</Text>
                <Ionicons name="chevron-forward" size={16} color="#F8B125" />
              </TouchableOpacity>
            ) : null}

            <Text style={styles.modalLabel}>Apelido</Text>
            <TextInput
              style={styles.modalInput}
              value={apelido}
              onChangeText={setApelido}
              placeholder='Ex: "Meu PIX"'
              autoCapitalize="sentences"
            />

            {modalErro ? <Text style={styles.modalErro}>{modalErro}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, salvando && styles.modalSaveDisabled]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={styles.modalSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  if (isCliente) {
    return (
      <View style={clienteStyles.root}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 16 }}
        >
          <View style={[clienteStyles.header, { paddingTop: topPadding }]}>
            <View style={clienteStyles.headerTop}>
              <BackButton onPress={goBack} iconColor={PRIMARY} />
              <View style={clienteStyles.brandRow}>
                <Text style={clienteStyles.brandQuick}>Quick</Text>
                <Text style={clienteStyles.brandStock}>Stock</Text>
              </View>
              <View style={{ width: 32 }} />
            </View>
            <Text style={clienteStyles.title}>Pagamento</Text>
            <Text style={clienteStyles.subtitle}>
              Cadastre PIX, cartão ou dinheiro para finalizar seus pedidos.
            </Text>
          </View>

          <View style={clienteStyles.sheet}>
            <TouchableOpacity style={clienteStyles.addButton} onPress={abrirModal} activeOpacity={0.85}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={clienteStyles.addButtonText}>Adicionar forma de pagamento</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
            ) : error ? (
              <View style={clienteStyles.emptyCard}>
                <Text style={clienteStyles.errorText}>{error}</Text>
                <TouchableOpacity onPress={carregar}>
                  <Text style={clienteStyles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : formas.length === 0 ? (
              <>
                <View style={clienteStyles.emptyCard}>
                  <Ionicons name="card-outline" size={48} color={PRIMARY} />
                  <Text style={clienteStyles.emptyTitle}>Nenhuma forma cadastrada</Text>
                  <Text style={clienteStyles.emptyText}>
                    Adicione PIX, crédito, débito ou dinheiro para pagar seus pedidos.
                  </Text>
                </View>
                <View style={clienteStyles.infoCard}>
                  <View style={clienteStyles.infoIcon}>
                    <Ionicons name="information-circle" size={18} color={PRIMARY} />
                  </View>
                  <Text style={clienteStyles.infoText}>
                    Depois de cadastrar, toque na forma para incluir chaves PIX ou dados do cartão.
                  </Text>
                </View>
              </>
            ) : (
              <View style={clienteStyles.listCard}>
                {formas.map((forma) => (
                  <View key={forma.id} style={clienteStyles.formaRow}>
                    <TouchableOpacity
                      style={clienteStyles.formaMain}
                      activeOpacity={isFormaComDetalhes(forma.tipo) ? 0.75 : 1}
                      onPress={() => handlePressForma(forma)}
                      disabled={!isFormaComDetalhes(forma.tipo)}
                    >
                      <View style={clienteStyles.formaIcon}>
                        <Ionicons name={iconeTipoPagamento(forma.tipo)} size={20} color={PRIMARY} />
                      </View>
                      <View style={clienteStyles.formaInfo}>
                        <Text style={clienteStyles.formaApelido}>{forma.apelido}</Text>
                        <Text style={clienteStyles.formaTipo}>
                          {forma.label || labelTipoPagamento(forma.tipo)}
                          {forma.principal ? ' · Principal' : ''}
                          {hintForma(forma.tipo)}
                        </Text>
                      </View>
                      {isFormaComDetalhes(forma.tipo) ? (
                        <Ionicons name="chevron-forward" size={16} color="#C5CAD3" />
                      ) : null}
                    </TouchableOpacity>
                    <IconActionButton
                      name="trash-outline"
                      size={20}
                      accessibilityLabel="Remover forma de pagamento"
                      onPress={() => confirmarRemocao(forma)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <BottomTabBar activeRoute="FormasPagamento" />
        {extras}
      </View>
    );
  }

  return (
    <>
      <TabScreenLayout
        title="Formas de pagamento"
        subtitle="Cadastre as formas que deseja usar no checkout da sacola."
        wrapContent={false}
        tabBar={<BottomTabBar activeRoute="FormasPagamento" />}
      >
        <PagePrimaryButton
          label="Adicionar forma"
          icon="add-circle-outline"
          onPress={abrirModal}
          compact
          light
          style={styles.addButton}
        />

        {loading ? (
          <ActivityIndicator color="#F8B125" style={{ marginTop: 24 }} />
        ) : error ? (
          <View style={styles.sectionCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={carregar}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : formas.length === 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="wallet-outline" size={22} color="#F8B125" />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma forma cadastrada</Text>
            <Text style={styles.emptyText}>
              Adicione PIX, cartão ou dinheiro para finalizar pedidos na sacola.
            </Text>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cadastradas</Text>
              <Text style={styles.sectionSubtitle}>
                {formas.length} forma(s) de pagamento
              </Text>
            </View>
            {formas.map((forma, index) => (
              <View
                key={forma.id}
                style={[styles.formaCard, index === formas.length - 1 && styles.cardLast]}
              >
                <TouchableOpacity
                  style={styles.formaMain}
                  activeOpacity={isFormaComDetalhes(forma.tipo) ? 0.75 : 1}
                  onPress={() => handlePressForma(forma)}
                  disabled={!isFormaComDetalhes(forma.tipo)}
                >
                  <View style={styles.formaIconWrap}>
                    <Ionicons name={iconeTipoPagamento(forma.tipo)} size={22} color="#F8B125" />
                  </View>
                  <View style={styles.formaInfo}>
                    <Text style={styles.formaApelido}>{forma.apelido}</Text>
                    <Text style={styles.formaTipo}>
                      {forma.label || labelTipoPagamento(forma.tipo)}
                      {forma.principal ? ' · Principal' : ''}
                      {hintForma(forma.tipo)}
                    </Text>
                  </View>
                  {isFormaComDetalhes(forma.tipo) ? (
                    <Ionicons name="chevron-forward" size={16} color="#D4B56A" style={styles.chevron} />
                  ) : null}
                </TouchableOpacity>
                <IconActionButton
                  name="trash-outline"
                  size={20}
                  accessibilityLabel="Remover forma de pagamento"
                  onPress={() => confirmarRemocao(forma)}
                />
              </View>
            ))}
          </View>
        )}
      </TabScreenLayout>
      {extras}
    </>
  );
}
