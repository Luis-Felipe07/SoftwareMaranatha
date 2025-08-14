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

const ReservasScreen = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      const reservasData = await apiService.getReservas();
      setReservas(reservasData);
    } catch (error) {
      console.error('Error loading reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservas();
    setRefreshing(false);
  };

  const handleReservaPress = (reserva) => {
    const opciones = [
      { text: 'Cerrar', style: 'cancel' }
    ];

    // Solo agregar opciones de cambio de estado si la reserva está pendiente o confirmada
    if (reserva.estado === 'PENDIENTE') {
      opciones.unshift(
        {
          text: 'Confirmar',
          onPress: () => handleCambiarEstado(reserva, 'CONFIRMADA')
        },
        {
          text: 'Cancelar Reserva',
          style: 'destructive',
          onPress: () => handleCambiarEstado(reserva, 'CANCELADA')
        }
      );
    } else if (reserva.estado === 'CONFIRMADA') {
      opciones.unshift(
        {
          text: 'Marcar como Completada',
          onPress: () => handleCambiarEstado(reserva, 'COMPLETADA')
        }
      );
    }

    Alert.alert(
      `Reserva #${reserva.id}`,
      `Cliente: ${reserva.usuario?.nombre}\nFecha: ${formatFecha(reserva.fechaReserva)}\nHora: ${reserva.horaReserva}\nPersonas: ${reserva.numeroPersonas}\nEstado: ${reserva.estado}`,
      opciones
    );
  };

  const handleCambiarEstado = async (reserva, nuevoEstado) => {
    try {
      // Aquí necesitarías implementar el endpoint en el backend
      // await apiService.updateEstadoReserva(reserva.id, nuevoEstado);
      Alert.alert('Info', 'Funcionalidad de cambio de estado pendiente de implementar en el backend');
      // await loadReservas();
    } catch (error) {
      console.error('Error updating reserva:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la reserva');
    }
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return format(fecha, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return fechaString;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#FF9800';
      case 'CONFIRMADA':
        return '#4CAF50';
      case 'CANCELADA':
        return '#F44336';
      case 'COMPLETADA':
        return '#8BC34A';
      default:
        return '#9E9E9E';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'time-outline';
      case 'CONFIRMADA':
        return 'checkmark-circle-outline';
      case 'CANCELADA':
        return 'close-circle-outline';
      case 'COMPLETADA':
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const isReservaHoy = (fechaReserva) => {
    const hoy = new Date();
    const fecha = new Date(fechaReserva);
    return fecha.toDateString() === hoy.toDateString();
  };

  const renderReserva = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.reservaCard,
        isReservaHoy(item.fechaReserva) && styles.reservaHoy
      ]}
      onPress={() => handleReservaPress(item)}
    >
      <View style={styles.reservaHeader}>
        <View>
          <Text style={styles.reservaId}>Reserva #{item.id}</Text>
          {isReservaHoy(item.fechaReserva) && (
            <Text style={styles.reservaHoyLabel}>HOY</Text>
          )}
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Ionicons 
            name={getEstadoIcon(item.estado)} 
            size={16} 
            color="#fff" 
            style={styles.estadoIcon}
          />
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>

      <View style={styles.reservaInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.usuario?.nombre || 'Cliente no especificado'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {formatFecha(item.fechaReserva)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.horaReserva}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.numeroPersonas} personas
          </Text>
        </View>

        {item.mesa && (
          <View style={styles.infoRow}>
            <Ionicons name="restaurant-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Mesa {item.mesa.numero}
            </Text>
          </View>
        )}
      </View>

      {item.observaciones && (
        <View style={styles.observacionesContainer}>
          <Text style={styles.observacionesTitle}>Observaciones:</Text>
          <Text style={styles.observacionesText}>{item.observaciones}</Text>
        </View>
      )}

      <View style={styles.reservaFooter}>
        <Text style={styles.tapToView}>Toca para ver detalles</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando reservas...</Text>
      </View>
    );
  }

  const reservasHoy = reservas.filter(r => isReservaHoy(r.fechaReserva));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Total: {reservas.length} | Hoy: {reservasHoy.length}
        </Text>
      </View>

      <FlatList
        data={reservas}
        renderItem={renderReserva}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
  reservaCard: {
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
  reservaHoy: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reservaId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reservaHoyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  reservaInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  observacionesContainer: {
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  observacionesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  observacionesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  reservaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tapToView: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ReservasScreen;