# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  config.ssh.insert_key = false

  config.vm.provider :virtualbox do |vb, override|
    override.vm.box = "bytepark/trusty-64"
  end

  config.vm.define 'lambda' do |machine|
    machine.vm.hostname = 'lambda-build'
    machine.vm.network "private_network", type: "dhcp"

    machine.vm.provision :ansible do |ansible|
      ansible.playbook = 'playbook/main.yml'
      ansible.limit = 'all'
      ansible.sudo = true
      # ansible.ask_vault_pass = true
      ansible.groups = {
        "lambda" =>  ["lambda"]
      }
    end
  end
end
