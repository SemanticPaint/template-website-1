



// Used in flow decision points
const Constants = {
    DELETE: 'delete a progress',
    FORWARD: 'move forward a step in the flow',
    BACK: 'go back one step in the flow'
  }
  
  // Helpers
  const Utils = {
    sleep: async (durationMilliseconds) => {
      return new Promise(resolve => {
        return setTimeout(resolve, durationMilliseconds)
      })
    },
  }
  
  // Side-effects
  const Actions = {
    async loadUserProgress() {
      await Utils.sleep(2000)
      return window.localStorage.getItem('userProgress')
    },
  
    async saveUserProgress() {
      await Utils.sleep(2000)
      return window.localStorage.setItem(
        'userProgress',
        JSON.stringify({some: 'data'})
      )
    },
  
    async deleteUserProgress() {
      await Utils.sleep(2000)
      window.localStorage.removeItem('userProgress')
      return Promise.resolve()
    }
  }
  
  // All the ways the app can be in,
  // named and organized freely, using Promises
  const Flows = {
    master: async () => {
      const [ , progress ] = await Promise.all([
        Views.loading(),
        Actions.loadUserProgress()
      ])
      return progress ?
        Flows.continuation() :
        Flows.firstTime()
    },
  
    continuation: async () => {
      const { key } = await Views.main()
      
      // A map of possible sub-flows,
      // Depending on which button in main is clicked,
      // a different key means a different sequence
      return {
        async [Constants.FORWARD]() {
          await Views.afterMain()
          return Flows.continuation()
        },
  
        async [Constants.DELETE]() {
          await Promise.all([
            Views.deleting(),
            Actions.deleteUserProgress()
          ])
  
          return Flows.master()
        }
      }[key]()
    },
  
    firstTime: async () => {
      await Views.intro1()
      await Views.intro2()
      await Views.intro3()
      await Views.intro4()
  
      await Promise.all([
        Views.saving(),
        Actions.saveUserProgress()
      ])
   
      return Flows.continuation()
    }
  }
  
  // Things to render on the screen
  const Views = {
    init(el) {
      this.el = el
    },
  
    // One of the 2 "componentized" Views
    async messageWithCTA({ content, CTA }) {
      const getCTA = (maybeMultipleCTAs) => {
        if (Array.isArray(maybeMultipleCTAs)) {
          return maybeMultipleCTAs
        }
        return [CTA]
      }
  
      const template = () => {
        return `
          <form id="complete-step-form" class="view message-view">
            ${content}
            <footer>
              ${getCTA(CTA).map(eachCTA => `
                <button autofocus class="btn ${eachCTA.type || ''}" data-key="${eachCTA.key || Constants.FORWARD}">
                  ${eachCTA.text}
                </button>
              `).join('')}
            </footer>
          </form>
        `
      }
  
      const transitionDuration = 500
      
      const cssVariables = () => `;
        --transition-duration: ${transitionDuration};
      `
  
      const listenToFormSubmit = (onSubmit) => {
        const form = this.el.querySelector('#complete-step-form')
        form.addEventListener('submit', e => {
          e.preventDefault()
          form.classList.add('exiting')
          setTimeout(() => {
            onSubmit({
              key: e.submitter.dataset.key
            })
          }, transitionDuration)
        })
      }
      this.el.innerHTML = template()
      this.el.style.cssText += cssVariables()
  
      return new Promise(listenToFormSubmit)
    },
  
    // Another "component" View
    async statusFeedback({ text, type }) {
      const template = () => {
        const typeClassName = type || ''
        return `
          <div class="view status-feedback-view">
            <span class="animation-object ${type}"></span>
            <span class="status-text ${type}">${text}</span>
          </div>
        `
      }
  
      const animationDuration = 1000
  
      const cssVariables = () => `;
        --animation-duration: ${animationDuration}ms;
        --type: ${type};
      `
  
      this.el.innerHTML = template()
      this.el.style.cssText += cssVariables()
  
      const listenToAnimationEnd = (onEnd) => {
        setTimeout(onEnd, animationDuration)
      }   
  
      await new Promise(listenToAnimationEnd)
    },
  
    // A higher-order View, that uses a component
    async loading() {
      return Views.statusFeedback({
        text: 'loading',
        type: 'loading'
      })
    },
  
    async saving() {
      return Views.statusFeedback({
        text: 'saving',
        type: 'saving'
      })
    },
  
    async deleting() {
      return Views.statusFeedback({
        text: 'deleting',
        type: 'deleting'
      })
    },
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      
      
      
      
      
      
      
      
      
    // Another higher-order View, that uses a different component
    async intro1() {
      return Views.messageWithCTA({
        content: `
          <h1>Initial idea</h1>
          <div class="g-recaptcha" data-sitekey="6LdNXUYkAAAAALR3rza-asWoX41vPJDAW_-l207r"></div>
          <p>(1) The 'right' is passionate.</p> 
          <p>(2) The 'left' is passionate.</p>
          <p>(3) The 'moderates' roll up their sleeves and try to force both sides to behave. </p>
          <p>(4) Moderates - there is another way forward... </p>

        `,
        CTA: {
          text: "Consider (4)"
        }
      })
    },
  
    async intro2() {
      return Views.messageWithCTA({
        content: `
          <h1>Inner, not outer</h1>
          <p>Changing the outer world is like playing god.</p>
          <p>Instead of 'knowing what is best' and trying to force it (like everyone else), you can <i>cultivate your own garden.</i></p>

        `,
        CTA: {
          text: 'It has already been said...'
        }
      })
    },
  
    async intro3() {
      return Views.messageWithCTA({
        content: `
          <h1>Other people have said it best</h1>
          <p>Those in ancient times who wished to keep themselves alive did not use eloquence to ornament their knowledge. They did not use their knowledge to make trouble for the world; they did not use their knowledge to make trouble for Virtue. Loftily they kept to their places and returned to their inborn nature. Having done that, what more was there for them to do?</p>
          <h3>Come back later</h3>
        
        `,
          CTA: {
          text: ''
        }
      })
    },
  
    async intro4() {
      return Views.messageWithCTA({
        content: `
          <h1>Nothing yet</h1>
          <p>Nothing yet.</p>
          
        `,
        CTA: {
          text: 'Save it'
        },
      })
    },
  
    async main() {
      return Views.messageWithCTA({
        content: `
          <h1>Now...</h1>
          <p>Nothing</p>
          <p>nothing</p>
        `,
        CTA: [{
          text: 'Delete progress',
          type: 'danger',
          key: Constants.DELETE
        }, {
          text: 'Link for later',
          type: 'different',
          key: Constants.FORWARD
        }]
      })
    },
  
    async afterMain() {
      return Views.messageWithCTA({
        content: `
        <a href="https://github.com/Tytan-Codes?tab=repositories" target="page"><img src="clickMe.png" alt="BRUH" style="width:100px;height:100px;"></a>
        `,
        CTA: {
          text: 'Go back',
          type: 'different'
        }
      })
    },
  }
  
  // Views should recognize the container
  Views.init(document.getElementById('app'))
  
  // Init one of the flows
  Flows.master()

