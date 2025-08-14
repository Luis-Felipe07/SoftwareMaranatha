import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { apiService } from '../services/apiService';

const PedidosScreen = ({ navigation }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const pedidosData = await apiService.getPedidos();
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error loading pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPedidos();
    setRefreshing(false);
  };

  const handleEstadoChange = async (pedido) => {
    // Verificar que tenemos un ID válido del pedido
    const pedidoId = pedido.id || pedido.idPedido;
    if (!pedidoId) {
      Alert.alert('Error', 'No se puede actualizar un pedido sin ID válido');
      return;
    }

    // Solo mostrar opciones relevantes como en la versión web
    const opciones = [];
    
    // Si el pedido está pendiente, permitir marcarlo como entregado
    if (pedido.estado === 'PENDIENTE') {
      opciones.push({
        text: '✅ Marcar como Entregado',
        onPress: async () => {
          try {
            await apiService.updateEstadoPedido(pedidoId, 'ENTREGADO');
            await loadPedidos();
            Alert.alert('Éxito', 'Pedido marcado como entregado');
          } catch (error) {
            console.error('Error updating pedido:', error);
            const errorMsg = error.response?.data?.mensaje || 'No se pudo actualizar el estado del pedido';
            Alert.alert('Error', errorMsg);
          }
        }
      });
    }

    // Siempre permitir cancelar (si no está ya cancelado o entregado)
    if (pedido.estado !== 'CANCELADO' && pedido.estado !== 'ENTREGADO') {
      opciones.push({
        text: '❌ Cancelar Pedido',
        style: 'destructive',
        onPress: () => handleCancelarPedido(pedido)
      });
    }

    // Opción para ver detalles
    opciones.push({
      text: '👁️ Ver Detalle',
      onPress: () => {
        // Mostrar detalles del pedido
        const detalles = `
Pedido #${pedidoId}
Estado: ${pedido.estado}
Cliente: ${pedido.nombreCliente || pedido.usuario?.nombre || 'No especificado'}
Total: $${pedido.total?.toFixed(2) || '0.00'}
Fecha: ${formatFecha(pedido.fechaPedido)}

${pedido.items && pedido.items.length > 0 ? 
  'Platos:\n' + pedido.items.map(item => `• ${item.plato?.nombre || 'Plato'} x${item.cantidad}`).join('\n') 
  : 'Sin items especificados'}
        `;
        Alert.alert('Detalle del Pedido', detalles.trim());
      }
    });

    // Opción para cerrar
    opciones.push({
      text: 'Cerrar',
      style: 'cancel'
    });

    Alert.alert(
      'Gestión de Pedido',
      `Pedido #${pedidoId} - Estado: ${pedido.estado}`,
      opciones
    );
  };

  const handleCancelarPedido = async (pedido) => {
    const pedidoId = pedido.id || pedido.idPedido;
    
    Alert.alert(
      'Cancelar Pedido',
      `¿Estás seguro de cancelar el pedido #${pedidoId}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelarPedido(pedidoId);
              await loadPedidos();
              Alert.alert('Éxito', 'Pedido cancelado correctamente');
            } catch (error) {
              console.error('Error canceling pedido:', error);
              const errorMsg = error.response?.data?.mensaje || 'No se pudo cancelar el pedido';
              Alert.alert('Error', errorMsg);
            }
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#FF9800';
      case 'EN_PREPARACION':
        return '#2196F3';
      case 'LISTO':
        return '#4CAF50';
      case 'ENTREGADO':
        return '#8BC34A';
      case 'CANCELADO':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'time-outline';
      case 'EN_PREPARACION':
        return 'restaurant-outline';
      case 'LISTO':
        return 'checkmark-circle-outline';
      case 'ENTREGADO':
        return 'checkmark-done-outline';
      case 'CANCELADO':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return format(fecha, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return fechaString;
    }
  };

  const renderPedido = ({ item }) => {
    const pedidoId = item.id || item.idPedido;
    
    return (
      <TouchableOpacity
        style={styles.pedidoCard}
        onPress={() => handleEstadoChange(item)}
      >
        <View style={styles.pedidoHeader}>
          <View>
            <Text style={styles.pedidoId}>Pedido #{pedidoId}</Text>
            <Text style={styles.pedidoFecha}>{formatFecha(item.fechaPedido)}</Text>
          </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Ionicons 
            name={getEstadoIcon(item.estado)} 
            size={16} 
            color="#fff" 
            style={styles.estadoIcon}
          />
          <Text style={styles.estadoText}>{item.estado.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.pedidoInfo}>
        {item.mesa && (
          <Text style={styles.pedidoMesa}>Mesa: {item.mesa.numero}</Text>
        )}
        {item.usuario && (
          <Text style={styles.pedidoCliente}>Cliente: {item.usuario.nombre}</Text>
        )}
        <Text style={styles.pedidoTotal}>Total: ${item.total?.toFixed(2) || '0.00'}</Text>
      </View>

      {item.items && item.items.length > 0 && (
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Platos:</Text>
          {item.items.slice(0, 3).map((itemPedido, index) => (
            <Text key={index} style={styles.itemText}>
              • {itemPedido.plato?.nombre} x{itemPedido.cantidad}
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 3} platos más...
            </Text>
          )}
        </View>
      )}

      <View style={styles.pedidoFooter}>
        <Text style={styles.tapToChange}>Toca para cambiar estado</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Total de pedidos: {pedidos.length}</Text>
      </View>

      <FlatList
        data={pedidos}
        renderItem={renderPedido}
        keyExtractor={(item) => {
          const pedidoId = item.id || item.idPedido;
          return pedidoId ? pedidoId.toString() : Math.random().toString();
        }}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para crear pedido */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CrearPedido')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pedidoFecha: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  estadoIcon: {
    marginRight: 5,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pedidoInfo: {
    marginBottom: 10,
  },
  pedidoMesa: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  pedidoCliente: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  pedidoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  itemsContainer: {
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 3,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tapToChange: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default PedidosScreen;