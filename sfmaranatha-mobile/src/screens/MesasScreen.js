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
import { apiService } from '../services/apiService';

const MesasScreen = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMesas();
  }, []);

  const loadMesas = async () => {
    try {
      const mesasData = await apiService.getMesas();
      setMesas(mesasData);
    } catch (error) {
      console.error('Error loading mesas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMesas();
    setRefreshing(false);
  };

  const handleEstadoChange = async (mesa) => {
    const estados = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO'];
    const currentIndex = estados.indexOf(mesa.estado);
    const nextEstado = estados[(currentIndex + 1) % estados.length];

    Alert.alert(
      'Cambiar Estado',
      `¿Cambiar mesa ${mesa.numero} de ${mesa.estado} a ${nextEstado}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await apiService.updateEstadoMesa(mesa.id, nextEstado);
              await loadMesas(); // Recargar las mesas
            } catch (error) {
              console.error('Error updating mesa:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado de la mesa');
            }
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'DISPONIBLE':
        return '#4CAF50';
      case 'OCUPADA':
        return '#F44336';
      case 'RESERVADA':
        return '#FF9800';
      case 'MANTENIMIENTO':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'checkmark-circle-outline';
      case 'OCUPADA':
        return 'people-outline';
      case 'RESERVADA':
        return 'time-outline';
      case 'MANTENIMIENTO':
        return 'construct-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const renderMesa = ({ item }) => (
    <TouchableOpacity
      style={styles.mesaCard}
      onPress={() => handleEstadoChange(item)}
    >
      <View style={styles.mesaHeader}>
        <Text style={styles.mesaNumero}>Mesa {item.numero}</Text>
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
      
      <View style={styles.mesaInfo}>
        <Text style={styles.mesaCapacidad}>
          Capacidad: {item.capacidad} personas
        </Text>
        <Text style={styles.mesaUbicacion}>
          Ubicación: {item.ubicacion}
        </Text>
      </View>

      <View style={styles.mesaFooter}>
        <Text style={styles.tapToChange}>Toca para cambiar estado</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando mesas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Total de mesas: {mesas.length}</Text>
      </View>

      <FlatList
        data={mesas}
        renderItem={renderMesa}
        keyExtractor={(item) => item.id.toString()}
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
  mesaCard: {
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
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mesaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  mesaInfo: {
    marginBottom: 10,
  },
  mesaCapacidad: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  mesaUbicacion: {
    fontSize: 14,
    color: '#666',
  },
  mesaFooter: {
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
});

export default MesasScreen;