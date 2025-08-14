import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../services/apiService';

const CrearPedidoScreen = ({ navigation }) => {
  const [mesas, setMesas] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [selectedPlatos, setSelectedPlatos] = useState([]);
  const [clienteEmail, setClienteEmail] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mesasData, platosData] = await Promise.all([
        apiService.getMesas(),
        apiService.getPlatos()
      ]);
      setMesas(mesasData.filter(mesa => mesa.estado === 'DISPONIBLE'));
      setPlatos(platosData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const handleSelectMesa = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleSelectPlato = (plato) => {
    const existingIndex = selectedPlatos.findIndex(item => item.plato.id === plato.id);
    
    if (existingIndex >= 0) {
      // Si ya existe, aumentar cantidad
      const updatedPlatos = [...selectedPlatos];
      updatedPlatos[existingIndex].cantidad += 1;
      setSelectedPlatos(updatedPlatos);
    } else {
      // Si no existe, agregar nuevo
      setSelectedPlatos([...selectedPlatos, {
        plato: plato,
        cantidad: 1,
        precioUnitario: plato.precio
      }]);
    }
  };

  const handleRemovePlato = (platoId) => {
    setSelectedPlatos(selectedPlatos.filter(item => item.plato.id !== platoId));
  };

  const handleChangeCantidad = (platoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleRemovePlato(platoId);
      return;
    }

    const updatedPlatos = selectedPlatos.map(item => 
      item.plato.id === platoId 
        ? { ...item, cantidad: nuevaCantidad }
        : item
    );
    setSelectedPlatos(updatedPlatos);
  };

  const calcularTotal = () => {
    return selectedPlatos.reduce((total, item) => 
      total + (item.cantidad * item.precioUnitario), 0
    );
  };

  const handleCrearPedido = async () => {
    if (!selectedMesa) {
      Alert.alert('Error', 'Debe seleccionar una mesa');
      return;
    }

    if (selectedPlatos.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un plato');
      return;
    }

    if (!clienteEmail.trim()) {
      Alert.alert('Error', 'Debe ingresar el email del cliente');
      return;
    }

    setLoading(true);
    try {
      const pedidoData = {
        correoCliente: clienteEmail.trim(),
        mesaId: selectedMesa.id,
        platos: selectedPlatos.map(item => ({
          platoId: item.plato.id,
          cantidad: item.cantidad
        })),
        observaciones: observaciones.trim() || null
      };

      await apiService.createPedido(pedidoData);
      Alert.alert('Éxito', 'Pedido creado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating pedido:', error);
      Alert.alert('Error', 'No se pudo crear el pedido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Selección de Mesa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar Mesa</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mesas.map((mesa) => (
            <TouchableOpacity
              key={mesa.id}
              style={[
                styles.mesaCard,
                selectedMesa?.id === mesa.id && styles.mesaSelected
              ]}
              onPress={() => handleSelectMesa(mesa)}
            >
              <Text style={styles.mesaNumero}>Mesa {mesa.numero}</Text>
              <Text style={styles.mesaCapacidad}>{mesa.capacidad} personas</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <TextInput
          style={styles.input}
          placeholder="Email del cliente"
          value={clienteEmail}
          onChangeText={setClienteEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Selección de Platos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agregar Platos</Text>
        {platos.map((plato) => (
          <TouchableOpacity
            key={plato.id}
            style={styles.platoCard}
            onPress={() => handleSelectPlato(plato)}
          >
            <View style={styles.platoInfo}>
              <Text style={styles.platoNombre}>{plato.nombre}</Text>
              <Text style={styles.platoDescripcion}>{plato.descripcion}</Text>
              <Text style={styles.platoPrecio}>${plato.precio}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Platos Seleccionados */}
      {selectedPlatos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platos del Pedido</Text>
          {selectedPlatos.map((item) => (
            <View key={item.plato.id} style={styles.selectedPlatoCard}>
              <View style={styles.selectedPlatoInfo}>
                <Text style={styles.selectedPlatoNombre}>{item.plato.nombre}</Text>
                <Text style={styles.selectedPlatoPrecio}>
                  ${item.precioUnitario} x {item.cantidad} = ${item.precioUnitario * item.cantidad}
                </Text>
              </View>
              <View style={styles.cantidadControls}>
                <TouchableOpacity
                  onPress={() => handleChangeCantidad(item.plato.id, item.cantidad - 1)}
                  style={styles.cantidadButton}
                >
                  <Ionicons name="remove" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.cantidadText}>{item.cantidad}</Text>
                <TouchableOpacity
                  onPress={() => handleChangeCantidad(item.plato.id, item.cantidad + 1)}
                  style={styles.cantidadButton}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemovePlato(item.plato.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Observaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observaciones</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Observaciones adicionales..."
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Total y Botón */}
      {selectedPlatos.length > 0 && (
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>
            Total: ${calcularTotal().toFixed(2)}
          </Text>
          <TouchableOpacity
            style={[styles.crearButton, loading && styles.crearButtonDisabled]}
            onPress={handleCrearPedido}
            disabled={loading}
          >
            <Text style={styles.crearButtonText}>
              {loading ? 'Creando...' : 'Crear Pedido'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  mesaCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mesaSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  mesaNumero: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  mesaCapacidad: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  platoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  platoInfo: {
    flex: 1,
  },
  platoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  platoDescripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  platoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 4,
  },
  selectedPlatoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedPlatoInfo: {
    flex: 1,
  },
  selectedPlatoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedPlatoPrecio: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadButton: {
    backgroundColor: '#2196F3',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  crearButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  crearButtonDisabled: {
    backgroundColor: '#ccc',
  },
  crearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrearPedidoScreen;