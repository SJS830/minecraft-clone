import EventEmitter from "events";

import LocalPlayer from "/player/LocalPlayer.js";
import World from "/world/World.js";
import * as Network from "/network/Network.js";
import Renderer from "/renderer/Renderer.js";
import Input from "/interface/Input.js";
import * as MesherThreadPool from "/utils/MesherThreadPool.js"
import ChatBoxGui from "/gui/ChatBox.js";
import HotBarGui from "/gui/HotBar.js";
import CrosshairGui from "/gui/Crosshair.js";

export default class Minecraft {
  LocalPlayer;
  Renderer;
  Network;
  Gui;
  World;
  Input;
  EventHandler;

  init() {
    this.EventHandler = new EventEmitter();

    this.ChatBoxGui = new ChatBoxGui();
    this.ChatBoxGui.init();

    this.HotBarGui = new HotBarGui();
    this.HotBarGui.init();

    this.CrosshairGui = new CrosshairGui();
    this.CrosshairGui.init();

    this.Renderer = new Renderer();
    this.Renderer.createRenderer();

    this.LocalPlayer = new LocalPlayer();
    this.LocalPlayer.attach();

    this.World = new World();

    this.Input = new Input();
    this.Input.attach(this.Renderer);

    Network.init();
    MesherThreadPool.init();
  }

  static getPlayer() {
    return this.getInstance().LocalPlayer;
  }

  static getRenderer() {
    return this.getInstance().Renderer;
  }

  static getNetwork() {
    return this.getInstance().Network;
  }

  static getGui() {
    return this.getInstance().Gui;
  }

  static getWorld() {
    return this.getInstance().World;
  }

  static getInput() {
    return this.getInstance().Input;
  }

  static getEventHandler() {
    return this.getInstance().EventHandler;
  }

  //Singleton
  static getInstance() {
    if (!Minecraft._instance) {
      Minecraft._instance = new Minecraft();
    }

    return Minecraft._instance;
  }
}

Minecraft.getInstance().init();
