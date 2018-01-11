//@flow

import React from 'react'

import styled from 'styled-components/native'

import {
    Text,
    View,
    ScrollView,
    TextInput,
    Alert,
    TouchableOpacity,
} from 'react-native'

import Modal from 'react-native-modal'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Font } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import { sample, chunk } from 'lodash'

const BRAND_COLOR = '#78abbf'

import TodoCard from './components/TodoCard'

type State = {
    loaded: boolean,
    grid?: boolean,
    todoCards: Array<string>,
    newCardName?: string,
}

export default class App extends React.Component<{}, State> {
    state = {
        loaded: false,
        grid: true,
        todoCards: [
            // 'groceries',
        ],
        newCardName: '',
    }

    body: Object

    popupDialog: any

    async handleFontLoad() {
        try {
            await Font.loadAsync({
                roboto: require('./assets/fonts/Roboto-Light.ttf'),
                robotoMed: require('./assets/fonts/Roboto-Medium.ttf'),
                robotoSlab: require('./assets/fonts/RobotoSlab-Regular.ttf'),
                robotoSlabLight: require('./assets/fonts/RobotoSlab-Thin.ttf'),
                robotoSlabBold: require('./assets/fonts/RobotoSlab-Bold.ttf'),
            })

            this.setState({ loaded: true })
        } catch (error) {
            alert('error loading font')
        }
    }

    componentDidMount() {
        this.handleFontLoad()
    }

    handleMoveToBottom = () => {
        //need to scroll to end after adding
        this.body.scrollToEnd()
    }

    handleNewCard = () => {
        const { newCardName, todoCards } = this.state

        const newName = newCardName || 'new'
        this.setState(
            {
                todoCards: [...todoCards, newName],
            },
            () => {
                this.handleMoveToBottom()
                this.setState({ newCardName: '' })
            }
        )
    }

    handleTextChange = (newCardName: string) => {
        //NOTE really cheap hack because android has no way to handle an event on pressing enter
        const hasSpace = newCardName.search('\n')

        //need to wait for the setState to move to the end
        if (hasSpace !== -1) return this.handleNewCard()

        this.setState({ newCardName })
    }

    handleDelete = (cardName: string) => {
        const { todoCards } = this.state

        this.setState({
            todoCards: todoCards.filter(name => name !== cardName),
        })
    }

    renderBottomBar() {
        const inputStyles = {
            flex: 1,
            paddingLeft: 5,
            fontFamily: 'robotoSlab',
            alignSelf: 'center',
            color: 'white',
        }

        return (
            <BottomBar>
                <TextInput
                    style={inputStyles}
                    placeholderTextColor="#6395a9"
                    placeholder="Add new list..."
                    underlineColorAndroid="transparent"
                    onChangeText={this.handleTextChange}
                    value={this.state.newCardName}
                    multiline={true}
                />
                <BarIcon onPress={this.handleNewCard}>
                    <Ionicons name="md-add" size={30} color="white" />
                </BarIcon>
            </BottomBar>
        )
    }

    render() {
        let { loaded, grid, todoCards } = this.state

        if (!loaded) return null

        const gridStyles = {
            flexDirection: grid ? 'row' : 'column',
            marginBottom: 20,
        }

        const columnChunks = chunk(todoCards, 2)

        const checkForLastMargin = chunkKey =>
            chunkKey === columnChunks.length - 1 ? 20 : 0

        return (
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flex: 1 }}
                enableOnAndroid={true}
                bounces={false}
            >
                <Body
                    innerRef={component => (this.body = component)}
                    keyboardShouldPersistTaps="always"
                >
                    {!todoCards.length && (
                        <NoListYet>Well... let's get started!</NoListYet>
                    )}

                    {columnChunks.map((chunk, chunkKey) => (
                        <View
                            style={{
                                ...gridStyles,
                                marginBottom: checkForLastMargin(chunkKey),
                            }}
                            key={chunkKey}
                        >
                            {chunk.map((col, colKey) => (
                                <CardSingleColumn key={colKey}>
                                    <TodoCard
                                        name={col}
                                        isGrid={grid}
                                        handleDelete={name =>
                                            this.handleDelete(name)
                                        }
                                    />
                                </CardSingleColumn>
                            ))}
                        </View>
                    ))}
                </Body>

                {this.renderBottomBar()}
            </KeyboardAwareScrollView>
        )
    }
}

export const NoListYet = styled.Text`
    text-align: center;
    opacity: 0.5;
`

const BarIcon = styled(TouchableOpacity)`
    padding: 5px;
    margin-left: 10px;
`

const BottomBar = styled.View`
    padding: 1px;
    height: 45px;
    background-color: ${BRAND_COLOR};
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 10px;
`

const CardSingleColumn = styled.View`
    flex: 1;
`

const Body = styled.ScrollView`
    margin-top: 20px;
    padding: 20px 10px;
    background-color: white;
    display: flex;
    flex-direction: column;
    padding-left: 0;
`
