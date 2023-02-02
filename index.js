console.log('What are you doing here?')
console.log('SUSSSSSS')

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
  
      const animationDuration = 1500
  
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
  
    // Another higher-order View, that uses a different component
    async intro1() {
      return Views.messageWithCTA({
        content: `
          <h1>Hello,</h1>
          <div class="g-recaptcha" data-sitekey="6LdNXUYkAAAAALR3rza-asWoX41vPJDAW_-l207r"></div>
          <p>You seem to be here for the first time. I'm Tytan, I LOVE coding! </p>
        `,
        CTA: {
          text: "Let's start!"
        }
      })
    },
  
    async intro2() {
      return Views.messageWithCTA({
        content: `
          <h1>Who am I</h1>
          <p>I'm a kid who loves to code.</p>
        `,
        CTA: {
          text: 'What else?'
        }
      })
    },
  
    async intro3() {
      return Views.messageWithCTA({
        content: `
          <h1>Things that I've coded:</h1>
          <p>I code most of my stuff in python.</p>
          <p>My favorite one is called <a href="https://github.com/Tytan-Codes/Better-Day" target="_blank">Better Day</a>: It makes your day easier as a developer easier.</p>

        `,
        CTA: {
          text: 'Keep Going'
        }
      })
    },
  
    async intro4() {
      return Views.messageWithCTA({
        content: `
          <h1>My Github</h1>
          <p>You can check me out at <a href="https://github.com/tytan-codes" target="_blank">github.com/tytan-codes</a></p>
          <p>Your progress on this website will be saved, as you will soon see.</p>
        `,
        CTA: {
          text: "Save it"
        }
      })
    },
  
    async main() {
      return Views.messageWithCTA({
        content: `
          <h1>Now...</h1>
          <p>You can look at all my coding things:</p>
          <p>Check it out:</p>
        `,
        CTA: [{
          text: 'Delete progress',
          type: 'danger',
          key: Constants.DELETE
        }, {
          text: 'My repos',
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