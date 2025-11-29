extends CanvasLayer

# --- RUTAS A TUS ESCENAS (Asegúrate de que estas carpetas y archivos existen) ---
var stable_scene = preload("res://scenes/stable/Stable.tscn")
var casino_scene = preload("res://scenes/casino/CasinoLobby.tscn")
var stadium_scene = preload("res://scenes/stadium/Stadium.tscn")

# --- REFERENCIAS A LOS NODOS ---
# Ajusta estas rutas si te marca error en rojo
@onready var game_viewport = $RootContainer/MainHBox/GameViewportContainer/GameViewport

# Botones del Menú
@onready var btn_stable = $RootContainer/MainHBox/RightPanel/RightVBox/TravelSection/BtnStable
@onready var btn_stadium = $RootContainer/MainHBox/RightPanel/RightVBox/TravelSection/BtnStadium
@onready var btn_casino = $RootContainer/MainHBox/RightPanel/RightVBox/TravelSection/BtnCasino

func _ready():
	# 1. Conectar las señales
	btn_stable.pressed.connect(_on_btn_stable_pressed)
	btn_stadium.pressed.connect(_on_btn_stadium_pressed)
	btn_casino.pressed.connect(_on_btn_casino_pressed)
	
	# 2. Cargar el Establo al inicio
	change_view(stable_scene)

# --- FUNCIÓN PARA CAMBIAR PANTALLAS ---
func change_view(target_scene: PackedScene):
	# Borrar la escena anterior
	for child in game_viewport.get_children():
		child.queue_free()
	
	# Poner la nueva
	var new_instance = target_scene.instantiate()
	
	# Ajustar tamaño para que llene el hueco
	if new_instance is Control:
		new_instance.layout_mode = 3 
		new_instance.set_anchors_preset(Control.PRESET_FULL_RECT)
		
	game_viewport.add_child(new_instance)

# --- BOTONES ---
func _on_btn_stable_pressed():
	change_view(stable_scene)

func _on_btn_stadium_pressed():
	change_view(stadium_scene)

func _on_btn_casino_pressed():
	change_view(casino_scene)
