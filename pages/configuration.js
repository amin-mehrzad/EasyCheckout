import {
  Banner,
  Card,
  DisplayText,
  Form,
  FormLayout,
  Layout,
  Page,
  PageActions,
  SettingToggle,
  TextField,
  TextStyle,
  Toast
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Query } from 'react-apollo';

const CREAT_SCRIPT = gql`
  mutation scriptTagCreate($input: ScriptTagInput!) {
    scriptTagCreate(input: $input) {
      scriptTag {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
  `;
const UPDATE_SCRIPT = gql`
  mutation scriptTagUpdate($id: ID!, $input: ScriptTagInput!) {
    scriptTagUpdate(id: $id, input: $input) {
      scriptTag {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
  `;
const GET_LIST_SCRIPT = gql`
  {
    scriptTags(first: 7) {
      edges {
        node {
          id
          src
          createdAt
          updatedAt
        }
      }
    }
  }  
  `;
const DELETE_SCRIPT = gql`
mutation scriptTagDelete($id: ID!) {
  scriptTagDelete(id: $id) {
    deletedScriptTagId
    userErrors {
      field
      message
    }
  }
}
`;

class AddScript extends React.Component {
  state = {
    enabled: false,
    isEmpty: true,
    rewrtieMode: false,
    key: '',
    src: '',
    id: '',
    script: CREAT_SCRIPT,
    enablaDisableScript: DELETE_SCRIPT
  };

  // componentDidMount() {
  //     this.setState({ key: this.itemToBeConsumed() });
  // }



  render() {

    const emptyState = !store.get('key');
    const { enabled, isEmpty, key, src, id, rewrtieMode, script, enablaDisableScript } = this.state;
    const contentStatus = enabled ? 'Disable' : 'Enable';
    const textStatus = enabled ? 'enabled' : 'disabled';
    const titleForToggle = contentStatus + " ValidAge Popup";
    //const titleForCheckoutToggle=contentStatus +" ValidAge Popup";
    console.log(this.state);

    return (
      <Page title="Age Verification Popup Configuration">
        <Page>
          <Query query={GET_LIST_SCRIPT}>
            {({ data, loading, error }) => {
              // debugger;
              if (loading) { return <div>Loading…</div>; }
              if (error) { return <div>{error.message}</div>; }
              console.log(data);
              // if (data.scriptTags.edges[0] && this.state.isEmpty==true) {
              if ((data.scriptTags.edges[0] && this.state.isEmpty == true) || this.state.rewrtieMode == true) {
                const str = data.scriptTags.edges[0].node.src;
                this.setState({ enabled: true });
                // if (this.state.isChanged == false) {
                this.state.key = ((str.split("."))[2].split("/"))[2];
                //this.state.script = { CREAT_SCRIPT };
                console.log(this.state);
                //  }
                this.state.id = data.scriptTags.edges[0].node.id;
                this.state.isEmpty = false;
                //this.setState({ script: UPDATE_SCRIPT });
                this.state.script = gql`
                            mutation scriptTagUpdate($id: ID!, $input: ScriptTagInput!) {
                              scriptTagUpdate(id: $id, input: $input) {
                                scriptTag {
                                  id
                                }
                                userErrors {
                                  field
                                  message
                                }
                              }
                            }
                            `;
              }
              console.log(this.state);
              return (

                <Mutation
                  mutation={this.state.script}
                >
                  {(handleSubmit, { error, data }) => {
                    const showError = error && (
                      <Banner status="critical">{error.message}</Banner>
                    );
                    // if(this.state.isEmpty==true){
                    // var showSuccess = data && data.scriptTagCreate.scriptTag.id && (
                    //     <Banner status="success">Age Verification Script Created Successfully</Banner>
                    // ); 
                    // }else{
                    //     var showSuccess = data && data.scriptTagUpdate.scriptTag.id && (
                    //         <Banner status="success">Age Verification Script Updated Successfully</Banner>
                    //     ); 
                    // }
                    return (

                      <Layout>
                        <Layout.Section>
                          {showError}
                        </Layout.Section>
                        <Layout.AnnotatedSection
                          title="ValidAge Pop-Up Key"
                          description="Please write your ValidAge Pop-Up Key in this form."
                        >
                          <Form>
                            <Card sectioned>
                              <FormLayout>
                                <TextField
                                  value={this.state.key}
                                  onChange={this.handleChange('key')}
                                  label="Popup Key"
                                  type="key"
                                />
                                <p>If you don't have a key click <a href="https://cloud.validage.com"> here </a> to register and get your key for FREE.</p>
                              </FormLayout>
                            </Card>

                            <PageActions
                              primaryAction={[
                                {
                                  content: 'Save',
                                  onAction: () => {
                                    const scriptVariableInput = {
                                      displayScope: 'ALL',
                                      src: 'https://cloud.validage.com/cache/' + key + '.js',
                                    };
                                    if (this.state.isEmpty) {
                                      this.setState({ isEmpty: false, enabled: true });
                                      handleSubmit({
                                        variables: { input: scriptVariableInput },
                                      });
                                      console.log('submission', scriptVariableInput);
                                      store.set('key', key);
                                      //this.state.isEmpty=false;
                                      // var showSuccess = data && data.scriptTagCreate.scriptTag.id && (
                                      //     <Banner status="success">Age Verification Script Created Successfully</Banner>
                                      // ); 
                                      this.forceUpdate();
                                      window.location.reload();

                                      alert();
                                    } else {
                                      this.setState({ state: this.state, enabled: true });
                                      handleSubmit({
                                        variables: { id: this.state.id, input: scriptVariableInput },
                                      });
                                      console.log('submission', scriptVariableInput);
                                      store.set('key', key);
                                      //this.forceUpdate();
                                      //  window.location.reload();

                                      // var showSuccess = data && data.scriptTagUpdate.scriptTag.id && (
                                      //     <Banner status="success">Age Verification Script Updated Successfully</Banner>
                                      //     );
                                    }
                                  },
                                },
                              ]}
                            />
                          </Form>
                        </Layout.AnnotatedSection>
                        <Mutation mutation={this.state.enablaDisableScript}>
                          {(handleSubmit, { error, data }) => {
                            const showError = error && (
                              <Banner status="critical">{error.message}</Banner>
                            );
                            return (
                              <Layout.AnnotatedSection
                                title={titleForToggle}
                                description="Temporarily disable App and enable it again."
                              >
                                <SettingToggle
                                  action={{
                                    content: contentStatus,
                                    onAction: () => {
                                      //this.handleToggle;
                                      const scriptVariableInput = {
                                        displayScope: 'ALL',
                                        src: 'https://cloud.validage.com/cache/' + key + '.js',
                                      };
                                      // if (this.state.isEmpty) {
                                      if (enabled == false) {
                                        this.setState({ isEmpty: false, enabled: !enabled });
                                        handleSubmit({
                                          variables: { input: scriptVariableInput },
                                        });
                                        console.log('submission', scriptVariableInput);
                                        store.set('key', key);
                                        //this.state.isEmpty=false;
                                        // var showSuccess = data && data.scriptTagCreate.scriptTag.id && (
                                        //     <Banner status="success">Age Verification Script Created Successfully</Banner>
                                        // ); 
                                        this.forceUpdate();
                                        window.location.reload();

                                        alert();
                                      } else {
                                        this.setState({ state: this.state, enabled: !enabled });
                                        handleSubmit({
                                          variables: { id: this.state.id },
                                        });
                                        //console.log('submission', scriptVariableInput);
                                        store.set('key', key);
                                        // var showSuccess = data && data.scriptTagUpdate.scriptTag.id && (
                                        //     <Banner status="success">Age Verification Script Updated Successfully</Banner>
                                        //     );
                                      }
                                    },
                                  }}
                                  enabled={enabled}
                                >
                                  The age validation Pop-Up is{' '}
                                  <TextStyle variation="strong">{textStatus}</TextStyle>.
                                                    </SettingToggle>
                              </Layout.AnnotatedSection>
                            );
                          }}
                        </Mutation>

                        <Mutation mutation={this.state.enablaDisableScript}>
                          {(handleSubmit, { error, data }) => {
                            const showError = error && (
                              <Banner status="critical">{error.message}</Banner>
                            );
                            return (
                              <Layout.AnnotatedSection
                                title="Enable Age Verification Checkout"
                                description="Changing Cart page theme by adding Age Verification PopUp"
                              >
                                <SettingToggle
                                  action={{
                                    content: contentStatus,
                                    onAction: () => {
                                      // //this.handleToggle;
                                      // const scriptVariableInput = {
                                      //     displayScope: 'ALL',
                                      //     src: 'https://cloud.validage.com/cache/' + key + '.js',
                                      // };
                                      // // if (this.state.isEmpty) {
                                      // if (enabled==false) {
                                      //     this.setState({ isEmpty: false ,  enabled: !enabled });
                                      //     handleSubmit({
                                      //         variables: { input: scriptVariableInput },
                                      //     });
                                      //     console.log('submission', scriptVariableInput);
                                      //     store.set('key', key);
                                      //     //this.state.isEmpty=false;
                                      //     // var showSuccess = data && data.scriptTagCreate.scriptTag.id && (
                                      //     //     <Banner status="success">Age Verification Script Created Successfully</Banner>
                                      //     // ); 
                                      //     this.forceUpdate();
                                      //     window.location.reload();

                                      //     alert();
                                      // } else {
                                      //     this.setState({ state: this.state ,enabled: !enabled});
                                      //     handleSubmit({
                                      //         variables: { id: this.state.id },
                                      //     });
                                      //     //console.log('submission', scriptVariableInput);
                                      //     store.set('key', key);
                                      //     // var showSuccess = data && data.scriptTagUpdate.scriptTag.id && (
                                      //     //     <Banner status="success">Age Verification Script Updated Successfully</Banner>
                                      //     //     );
                                      // }

                                      const Http = new XMLHttpRequest();
                                      const url = 'https://shoptest4321.myshopify.com/admin/api/2019-07/themes.json';
                                      Http.open("GET", url);
                                      Http.send();
                                      Http.onreadystatechange = function () {
                                        if (this.readyState == 4 && this.status == 200) {
                                          console.log(Http.responseText);
                                        }
                                      }
                                    },
                                  }}
                                  enabled={enabled}
                                >
                                  The age validation Pop-Up is{' '}
                                  <TextStyle variation="strong">{textStatus}</TextStyle>.
                                                    </SettingToggle>
                              </Layout.AnnotatedSection>
                            );
                          }}
                        </Mutation>

                      </Layout>
                    );
                  }}
                </Mutation>
              );
            }}
          </Query>
        </Page>
      </Page >
    );

  }

  // handleChange(event) {
  //     this.setState({key: event.target.value});
  //   }

  handleChange = (field) => {
    //this.state.isChanged = true;
    console.log(field);
    return (value) => this.setState({ [field]: value });
  };

  // itemToBeConsumed = () => {
  //     const key = store.get('key');
  //     const src = key;
  //     //   const src = item.variants.edges[0].node.price;
  //     //const variantId = item.variants.edges[0].node.id;
  //     //const discounter = src * 0.1;
  //     //this.setState({ src, variantId });
  //     this.setState({ src });
  //     return (src);
  // };
  handleToggle = () => {
    this.setState(({ enabled }) => {
      return { enabled: !enabled };
    });
  };
}

export default AddScript;