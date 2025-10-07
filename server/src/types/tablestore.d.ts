/**
 * TableStore类型声明文件
 * 为tablestore模块提供TypeScript类型支持
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'tablestore' {
  export class Client {
    constructor(config: {
      accessKeyId: string;
      secretAccessKey: string;
      endpoint: string;
      instancename: string;
    });

    putRow(params: any): Promise<any>;
    getRow(params: any): Promise<any>;
    updateRow(params: any): Promise<any>;
    deleteRow(params: any): Promise<any>;
    getRange(params: any): Promise<any>;
  }

  export class TunnelClient {
    constructor(config: {
      accessKeyId: string;
      secretAccessKey: string;
      endpoint: string;
      instancename: string;
    });

    connectTunnel(params: any): Promise<any>;
  }

  export class Condition {
    constructor(expectation: any, condition: any);
  }

  export enum RowExistenceExpectation {
    EXPECT_EXIST = 'EXPECT_EXIST',
    EXPECT_NOT_EXIST = 'EXPECT_NOT_EXIST',
    IGNORE = 'IGNORE'
  }

  export enum Direction {
    FORWARD = 'FORWARD',
    BACKWARD = 'BACKWARD'
  }

  export const INF_MIN: any;
  export const INF_MAX: any;
}

