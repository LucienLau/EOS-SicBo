import React, { Component } from 'react';
import { Table } from 'antd';
import Eos from 'eosjs';

// jungle net
// const network = {
//     blockchain: 'eos',
//     protocol: 'http',
//     host: 'junglehistory.cryptolions.io',  // filter-on = *
//     port: 18888,
//     chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'  // jungle net
// }

// kylin net
const network = {
    blockchain: 'eos',
    protocol: 'https',
    host: 'api-kylin.eoslaomao.com',  // filter-on = *
    port: '',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'  // kylin net
}
const contract_account = 'trustbetgame';

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

class SicBoRecords extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data_reveals: [],
        }

        this.eosjs = null;
        this.fetchRecord = this.fetchRecord.bind(this);
    }

    fetchRecord = () => {
        this.eosjs.getActions(contract_account, -1, -90).then(({ actions }) => {
            let limit = 20;  // 从90个actions里面筛选出20个我们想要的
            const _data_reveals = [];
            for ( let i = actions.length - 1; i >= 0 && limit > 0; i-- ) {
                if ( actions[i].action_trace
                    && actions[i].action_trace.act
                    && actions[i].action_trace.act.account === contract_account
                    && actions[i].action_trace.act.name === 'result'
                    && actions[i].action_trace.act.data
                    && actions[i].action_trace.act.data.res
                    && actions[i].action_trace.receipt
                    && actions[i].action_trace.receipt.receiver === contract_account ) {

                    _data_reveals.push({
                        key: i,
                        player: actions[i].action_trace.act.data.res.player,
                        time: new Date(actions[i].action_trace.act.data.res.txtime*1000).Format('MM-dd hh:mm:ss'),
                        payin: actions[i].action_trace.act.data.res.payin,
                        payout: actions[i].action_trace.act.data.res.payout,
                        payed: actions[i].action_trace.act.data.res.payed ? 'true' : 'false',
                        dices: actions[i].action_trace.act.data.res.dice.dice1 + '、' + actions[i].action_trace.act.data.res.dice.dice2 + '、' + actions[i].action_trace.act.data.res.dice.dice3,
                        detail: actions[i].action_trace.act.data.res.detail,
                    });

                    limit--;
                }
            }
            this.setState({ data_reveals: _data_reveals });
            setTimeout(this.fetchRecord, 1000);
        }).catch(err => {
            console.error( err );
            setTimeout(this.fetchRecord, 2000);
        });
    }

    componentDidMount = () => {
        this.eosjs = Eos({
            httpEndpoint: `${network.protocol}://${network.host}:${network.port}`,
            chainId: network.chainId
        });
        this.fetchRecord();
    }

    render() {

        const columns = [{
            key: 'player',
            dataIndex: 'player',
            title: 'Player',
            align: 'center',
            width: '15%',
        }, {
            key: 'time',
            dataIndex: 'time',
            title: 'Time',
            align: 'center',
            width: '15',
        }, {
            key: 'payin',
            dataIndex: 'payin',
            title: 'Payin',
            align: 'center',
            width: '15%',
        }, {
            key: 'payout',
            dataIndex: 'payout',
            title: 'Payout',
            align: 'center',
            width: '15%',
        }, {
            key: 'payed',
            dataIndex: 'payed',
            title: 'Payed',
            align: 'center',
            width: '10%',
        }, {
            key: 'dices',
            dataIndex: 'dices',
            title: 'Dices',
            align: 'center',
            width: '10%',
        }, {
            key: 'detail',
            dataIndex: 'detail',
            title: 'Detail',
            align: 'center',
            width: '20%',
        }];

        return (
            <div>
                <Table
                    loading={this.state.data_reveals.length <= 0 ? true : false}
                    columns={columns}
                    dataSource={this.state.data_reveals}
                    pagination={false}
                    style={{ width: "1080px", margin: "auto", backgroundColor: "#efefef" }}
                />
            </div>
        );
    }
}

export default SicBoRecords;