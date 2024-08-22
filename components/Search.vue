<template>

    <div class="All_search">
        <h1>Search</h1>
        <!--Input que contiene el texto a buscar, ademas de tener la funcionalidad de buscar la "movie"
        cuando damos en la tecla "Enter"-->
        <InputText :class="$style.Smovie" type='text' v-model="query" @keyup.enter="handleClick"
            placeholder="Enter a movie" />
        <!--Boton que busca en base al texto dado, solo buscara cuando se seleccione dicho boton-->
        <Button @click='handleClick' label="Search" icon="pi pi-search" unstyled
            pt:root="bg-teal-500 hover:bg-teal-700 active:bg-teal-900 cursor-pointer py-2 px-4 rounded-full border-0 flex gap-2"
            pt:label="text-white font-bold text-lg" pt:icon="text-white text-xl" />
        <!--Muestra los mensajes de exito o fallo-->
        <p-toast></p-toast>
        <div v-if="loading" class="modal-overlay">
            <!--Se crea un overlay, para mostrar la barra de carga y difuminar el fondo-->
            <ProgressBar :value="value" class="Loadbar"></ProgressBar>
        </div>
        <div>
            <div>
                <!--Tabla que contiene la informacion de las peliculas-->
                <DataTable :value="results" v-if="showTable">
                    <Column field="title" header="Movie"></Column>
                    <Column header="Poster">
                        <template #body="slotProps">
                            <img :src="'http://image.tmdb.org/t/p/w500/' + slotProps.data.poster_path" width="100">
                        </template>
                    </Column>
                    <Column field="release_date" header="Release Date"></Column>
                    <Column header="More">
                        <template #body="slotProps">
                            <Button label="Details" icon="pi pi-info" @click="openDialog(slotProps.data)"
                                class="p-button-sm p-button-secondary" />
                        </template>
                    </Column>
                </DataTable>
                <!-- Dialog que muestra detalles de la película -->
                <Dialog :visible.sync="showDialog" modal header="Movie Details"
                    :style="{ width: '50rem', backgroundColor: '#f0f0f0' }">
                    <!--Muestra la informacion de la pelicula que escogamos-->
                    <div v-if="selectedMovie">
                        <h2>{{ selectedMovie.title }}</h2>
                        <img :src="'http://image.tmdb.org/t/p/w500/' + selectedMovie.poster_path" width="200" />
                        <p><strong>Description:</strong> {{ selectedMovie.overview }}</p>
                        <p><strong>Release Date:</strong> {{ selectedMovie.release_date }}</p>
                        <p>
                            <strong>Rate:</strong> {{ selectedMovie.vote_average }}
                            <span class="rate"></span>
                        </p>
                    </div>
                    <!--Boton para cerrar la ventana de informacion-->
                    <div class="flex justify-end gap-2 mt-4">
                        <Button label="Close" icon="pi pi-times" @click="closeDialog" class="p-button-secondary" />
                    </div>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

export default {
    name: 'search',
    //Se registran componentes para su uso local
    components: {
        DataTable,
        Column,
        Dialog,
        Button,
        'p-toast': Toast,
    },
    data() {
        return {
            query: '',
            results: [],
            value: 0,
            loading: false,
            showTable: false,
            showDialog: false,
            selectedMovie: null,
        }
    },
    methods: {
        getResult(query) {
            axios.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: '974932e7d76b4d8fca8fae61c0bcf738', // API key
                    query: query // Aquí va el término de búsqueda
                }
            }).then(response => {
                this.results = response.data.results; // Trae la lista de las peliculas que se encontraron
                if (this.results.length > 0) { //Se valida si trae informacion, para mostrar el mensaje de exito
                    this.$toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos obtenidos correctamente', life: 3000 });
                    //console.log(this.results.length);
                } else { //Si no trae informacion, muestra un mensaje de error
                    this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los datos, valide la informacion ingresada.', life: 3000 });
                }
            }).catch(error => {
                // Aqui se tienen otros manejos de errores, como fallo en la conexion con la API, etc
                let errorMessage = 'Algo ha salido mal.';

                if (error.response) {
                    // El servidor respondió, pero el código de estado que indica un error
                    errorMessage = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
                } else if (error.request) {
                    // La solicitud se realizó pero no se recibió ninguna respuesta
                    errorMessage = 'No se recibió ninguna respuesta del servidor. Verifique su conexión a Internet.';
                } else {
                    // Algo sucedió al configurar la solicitud
                    errorMessage = `Error en la configuración de la solicitud: ${error.message}`;
                }
                this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 5000 });
                //console.error('Error al obtener los datos:', error);
            });
        },
        startLoading() {
            this.loading = true; // Se coloca en true, para indicar que la barra esta cargando
            this.value = 0; // Valor inicial de la carga de la barra
            this.showTable = false; // La tabla no se mostrara hasta que se tenga informacion que mostrar
            //Se establece un tiempo de espera de 1 seg, esto para que la barra se muestre con un estado mas natural
            this.loadingTimeout = setTimeout(() => {
                // Ejecuta la carga de la barra cada 0.5 seg 
                const interval = setInterval(() => {
                    const randomIncrement = Math.floor(Math.random() * 16) + 10; // Carga de la barra de 10 a 25
                    // Mientras valor sea menor al 100%, cargara la barra
                    if (this.value < 100) {
                        this.value = Math.min(this.value + randomIncrement, 100); // Asegura que no supere el 100%
                    // Si la barra ya cargo, ingresa a realizar las siguientes operaciones
                    } else {
                        // Detiene la carga de la barra
                        clearInterval(interval);
                        // La tabla se mostrara con la informacion
                        this.showTable = true;
                        // Realiza la consulta de la pelicula a buscar
                        this.getResult(this.query);
                        this.loading = false; // Se coloca de nuevo en false, ya que la carga ha terminado
                        //this.showProgressBar = false;
                    }
                }, 500);
            }, 1000);
        },
        handleClick() {
            if (this.loading || this.query.trim() === '') { // tambien se crear una opcion para que no cargue nada si no escribe una pelicula
                return; // Esto hace que no se pueda hacer otra busqueda una vez iniciada
            }
            // Llama a ambos métodos
            this.startLoading();
        },
        openDialog(movie) {
            this.showDialog = !this.showDialog; // Cambia el estado del mostrar Detalle de la pelicula, de False a True, mostrando el dialogo
            this.selectedMovie = movie; // muestra información específica sobre la película seleccionada
        },
        closeDialog() {
            this.showDialog = false; // Funcion para cerrar Detalle de la pelicula
        }
    }
}
</script>

<style module>
.p-dialog {
    z-index: 9999;
}
</style>