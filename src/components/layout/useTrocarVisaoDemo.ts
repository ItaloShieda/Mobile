import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { isContaDemo } from '../../config/demo';

/** Atalho da barra inferior que troca entre as visões de cliente e fornecedor, só na conta demo. */
export function useTrocarVisaoDemo() {
  const navigation = useNavigation<any>();
  const { user, perfilUso, podeAlternarPerfil, alternarPerfil } = useAuth();

  const visivel = isContaDemo(user?.email) && podeAlternarPerfil;
  const destino = perfilUso === 'Cliente' ? 'Fornecedor' : 'Cliente';
  const icon: keyof typeof Ionicons.glyphMap =
    destino === 'Cliente' ? 'person-circle-outline' : 'business-outline';

  const trocar = async () => {
    await alternarPerfil(destino);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return { visivel, label: destino, icon, trocar };
}
