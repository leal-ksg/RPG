# RPG

## Descrição do Projeto
Foi escolhido um minigame no estilo RPG. Toda a interação é feita por linha de comando e tem o objetivo de divertir o usuário.

## Regras do Jogo
As regras do jogo estão disponíveis no seguinte documento:
https://docs.google.com/document/d/12LyxRZmnAa0zapDkd-atwrhRConwNe8S9VUIk1z9gCc/edit?tab=t.0
    
## Instruções de Execução
* **Instalar as dependências:**
  ```bash
  npm install
  ```
    
* **Rodar a aplicação:**
  ```bash
  npm run dev
  ```
        
* Sempre que aparecer uma seta (->) ao lado de um texto, significa que o usuário deve realizar uma ação e inputar algum dado na aplicação.
    
## Mapeamento dos padrões de projeto

### Strategy (Comportamental)
- **Onde foi aplicado:** Estratégias de ataque dos personagens (tanto do jogador quanto dos chefes de fase).
- **Justificativa:** Cada tipo de entidade tem seus tipos de ataque diferentes. Ao invés de criar várias condicionais no código, apenas encapsulei cada comportamento em uma estratégia.
- **Pastas:** /strategies
        
### Singleton (Criacional)
- **Onde foi aplicado:** Nas classes AppManager e GameEventNotifier.
- **Justificativa:** O AppManager guarda as configurações do jogador e também gerencia o ciclo de vida do jogo. Escolhi o singleton para garantir que essa classe fosse instanciada apenas uma vez, impedindo a sobrescrita de configurações iniciais e quebra do fluxo do jogo.
Já o GameEventNotifier tem uma lista de observadores, então se instanciarmos em qualquer lugar do código podemos perder a lista. Por isso, também implementa o padrão singleton.
- **Pastas:** /core/index, /observers/game-notifier-observer
        
### Observer (Comportamental)
- **Onde foi aplicado:** Nas classes GameEventNotifier e CliRenderer.
- **Justificativa:** O CliRenderer precisava ser notificado sempre que os estados de saúde ou vida do jogador e do chefe de fase mudassem, para atualizar os valores em tela. Então, usei o padrão observer para que o CliRenderer se inscrevesse no GameEventNotifier e fosse notificado.
- **Pastas:** /observers
        
### Abstract Factory (Criacional)
- **Onde foi aplicado:** Na classe WarriorKitFactory e MageKitFactory.
- **Justificativa:** Essas duas classes tem seus conjuntos de objetos independentes. Ao invés de fazer várias condicionais no código, apenas instancio a factory escolhida e crio todos os objetos relacionados à ela.
- **Pastas:** /factories/character-kit-factory
        
### Decorator (Estrutural)
- **Onde foi aplicado:** Na classe RuneDecorator e suas filhas
- **Justificativa:** Dependendo da runa que o jogador escolher equipar, os atributos de sua arma primária mudam e funcionalidades são adicionadas. Para fazer isso sem usar várias condicionais e sem usar heranças complexas, utilizei o decorator
- **Pastas:** /decorators
